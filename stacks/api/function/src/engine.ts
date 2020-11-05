import {Inject, Injectable, Optional, OnModuleDestroy} from "@nestjs/common";
import {DatabaseService, MongoClient} from "@spica-server/database";
import {Scheduler} from "@spica-server/function/scheduler";
import {Package, PackageManager} from "@spica-server/function/pkgmanager";
import {Event} from "@spica-server/function/queue/proto";
import * as fs from "fs";
import {JSONSchema7} from "json-schema";
import * as path from "path";
import * as rimraf from "rimraf";
import {Observable, Subject} from "rxjs";
import {bufferTime, takeUntil} from "rxjs/operators";
import * as util from "util";
import {ChangeKind, FunctionService, TargetChange} from "./function.service";
import {Function} from "./interface";
import {FUNCTION_OPTIONS, Options} from "./options";
import {Schema, SCHEMA, SchemaWithName, SCHEMA1} from "./schema/schema";

@Injectable()
export class FunctionEngine implements OnModuleDestroy {
  readonly schemas = new Map<string, Schema>([
    ["http", require("./schema/http.json")],
    ["schedule", require("./schema/schedule.json")],
    ["firehose", require("./schema/firehose.json")],
    ["system", require("./schema/system.json")],
    ["database", () => getDatabaseSchema(this.db, this.mongo)]
  ]);
  readonly runSchemas = new Map<string, JSONSchema7>();

  private dispose = new Subject();

  constructor(
    private fs: FunctionService,
    private db: DatabaseService,
    private mongo: MongoClient,
    private scheduler: Scheduler,
    @Inject(FUNCTION_OPTIONS) private options: Options,
    @Optional() @Inject(SCHEMA) schema: SchemaWithName,
    @Optional() @Inject(SCHEMA1) private schema1: SchemaWithName
  ) {
    if (schema) {
      this.schemas.set(schema.name, schema.schema);
    }
    if (schema1) {
      this.schemas.set(schema1.name, schema1.schema);
    }
    this.fs
      .targets()
      .pipe(
        bufferTime(1),
        takeUntil(this.dispose)
      )
      .subscribe(changes => {
        this.categorizeChanges(changes);
      });
  }

  onModuleDestroy() {
    this.dispose.next();
  }

  private categorizeChanges(changes: TargetChange[]) {
    for (const [index, change] of changes.entries()) {
      switch (change.kind) {
        case ChangeKind.Added:
          this.subscribe(change);
          break;
        case ChangeKind.Updated:
          if (changes.findIndex(c => c.target.id == change.target.id) == index) {
            this.unsubscribe(change);
          }
          this.subscribe(change);
          break;
        case ChangeKind.Removed:
          this.unsubscribe(change);
          break;
      }
    }
  }

  private getDefaultPackageManager(): PackageManager {
    return this.scheduler.pkgmanagers.get("node");
  }

  getPackages(fn: Function): Promise<Package[]> {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    return this.getDefaultPackageManager().ls(functionRoot);
  }

  addPackage(fn: Function, qualifiedNames: string | string[]): Observable<number> {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    return this.getDefaultPackageManager().install(functionRoot, qualifiedNames);
  }

  removePackage(fn: Function, name: string): Promise<void> {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    return this.getDefaultPackageManager().uninstall(functionRoot, name);
  }

  async createFunction(fn: Function) {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    await fs.promises.mkdir(functionRoot, {recursive: true});
    // See: https://docs.npmjs.com/files/package.json#dependencies
    const packageJson = {
      name: fn.name,
      description: fn.description || "No description.",
      version: "0.0.1",
      private: true,
      keywords: ["spica", "function", "node.js"],
      license: "UNLICENSED"
    };

    return fs.promises.writeFile(
      path.join(functionRoot, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
  }

  deleteFunction(fn: Function) {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    return util.promisify(rimraf)(functionRoot);
  }

  compile(fn: Function) {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    const language = this.scheduler.languages.get(fn.language);
    return language.compile({
      cwd: functionRoot,
      entrypoint: `index.${language.description.extension}`
    });
  }

  update(fn: Function, index: string): Promise<void> {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    const language = this.scheduler.languages.get(fn.language);
    return fs.promises.writeFile(
      path.join(functionRoot, `index.${language.description.extension}`),
      index
    );
  }

  read(fn: Function): Promise<string> {
    const functionRoot = path.join(this.options.root, fn._id.toString());
    const language = this.scheduler.languages.get(fn.language);
    return fs.promises
      .readFile(path.join(functionRoot, `index.${language.description.extension}`))
      .then(b => b.toString());
  }

  getSchema(name: string): Observable<JSONSchema7 | null> | Promise<JSONSchema7 | null> {
    const schema = this.schemas.get(name);
    if (schema) {
      if (typeof schema == "function") {
        return schema();
      } else {
        return Promise.resolve(schema);
      }
    }
    return Promise.resolve(null);
  }

  getEnqueuer(name: string) {
    const enq = Array.from(this.scheduler.enqueuers);
    return enq.find(e => e.description.name == name);
  }

  private subscribe(change: TargetChange) {
    const enqueuer = this.getEnqueuer(change.type);
    if (enqueuer) {
      const target = new Event.Target({
        id: change.target.id,
        cwd: path.join(this.options.root, change.target.id),
        handler: change.target.handler,
        runtime: new Event.Runtime({
          name: "node",
          version: "15.0.1"
        }),
        context: new Event.SchedulingContext({
          timeout: change.target.context.timeout,
          env: Object.keys(change.target.context.env).reduce((envs, key) => {
            envs.push(
              new Event.SchedulingContext.Env({
                key,
                value: change.target.context.env[key]
              })
            );
            return envs;
          }, [])
        })
      });
      enqueuer.subscribe(target, change.options);
    } else {
      console.warn(`Couldn't find enqueuer ${change.type}.`);
    }
  }

  private unsubscribe(change: TargetChange) {
    for (const enqueuer of this.scheduler.enqueuers) {
      const target = new Event.Target({
        id: change.target.id,
        cwd: path.join(this.options.root, change.target.id),
        handler: change.target.handler
      });
      enqueuer.unsubscribe(target);
    }
  }
}

export function getDatabaseSchema(
  db: DatabaseService,
  mongo: MongoClient
): Observable<JSONSchema7> {
  return new Observable(observer => {
    const collectionNames = new Set<string>();

    const notifyChanges = () => {
      const schema: JSONSchema7 = {
        $id: "http://spica.internal/function/enqueuer/database",
        type: "object",
        required: ["collection", "type"],
        properties: {
          collection: {
            title: "Collection Name",
            type: "string",
            enum: Array.from(collectionNames)
          },
          type: {
            title: "Operation type",
            description: "Event Type",
            type: "string",
            enum: ["INSERT", "UPDATE", "REPLACE", "DELETE"]
          }
        },
        additionalProperties: false
      };
      observer.next(schema);
    };

    const stream = mongo.watch([
      {
        $match: {
          $or: [{operationType: "insert"}, {operationType: "drop"}],
          "ns.db": db.databaseName
        }
      }
    ]);

    stream.on("change", change => {
      switch (change.operationType) {
        case "drop":
          collectionNames.delete(change.ns.coll);
          notifyChanges();
          break;
        case "insert":
          if (!collectionNames.has(change.ns.coll)) {
            collectionNames.add(change.ns.coll);
            notifyChanges();
          }
          break;
      }
    });

    stream.on("close", () => observer.complete());

    db.collections().then(collections => {
      for (const collection of collections) {
        collectionNames.add(collection.collectionName);
      }
      notifyChanges();
    });

    return () => {
      stream.close();
    };
  });
}
