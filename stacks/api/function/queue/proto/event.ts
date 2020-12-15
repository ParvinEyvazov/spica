import * as pb_1 from "google-protobuf";
import * as grpc_1 from "@grpc/grpc-js";
export namespace event {
  export enum Type {
    HTTP = 0,
    DATABASE = 1,
    SCHEDULE = 3,
    FIREHOSE = 4,
    SYSTEM = 5,
    BUCKET = 6
  }
  export class SchedulingContext extends pb_1.Message {
    constructor(
      data?:
        | any[]
        | {
            env?: SchedulingContext.Env[];
            timeout?: number;
            batch?: SchedulingContext.Batch;
          }
    ) {
      super();
      pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [2], null);
      if (!Array.isArray(data) && typeof data == "object") {
        this.env = data.env;
        this.timeout = data.timeout;
        this.batch = data.batch;
      }
    }
    get env(): SchedulingContext.Env[] {
      return pb_1.Message.getRepeatedWrapperField(
        this,
        SchedulingContext.Env,
        2
      ) as SchedulingContext.Env[];
    }
    set env(value: SchedulingContext.Env[]) {
      pb_1.Message.setRepeatedWrapperField(this, 2, value);
    }
    get timeout(): number {
      return pb_1.Message.getFieldWithDefault(this, 3, undefined) as number;
    }
    set timeout(value: number) {
      pb_1.Message.setField(this, 3, value);
    }
    get batch(): SchedulingContext.Batch {
      return pb_1.Message.getWrapperField(
        this,
        SchedulingContext.Batch,
        4
      ) as SchedulingContext.Batch;
    }
    set batch(value: SchedulingContext.Batch) {
      pb_1.Message.setWrapperField(this, 4, value);
    }
    toObject() {
      return {
        env: this.env.map((item: SchedulingContext.Env) => item.toObject()),
        timeout: this.timeout,
        batch: this.batch && this.batch.toObject()
      };
    }
    serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
      const writer = w || new pb_1.BinaryWriter();
      if (this.env !== undefined)
        writer.writeRepeatedMessage(2, this.env, (item: SchedulingContext.Env) =>
          item.serialize(writer)
        );
      if (this.timeout !== undefined) writer.writeInt32(3, this.timeout);
      if (this.batch !== undefined)
        writer.writeMessage(4, this.batch, () => this.batch.serialize(writer));
      if (!w) return writer.getResultBuffer();
    }
    serializeBinary(): Uint8Array {
      throw new Error("Method not implemented.");
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): SchedulingContext {
      const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
        message = new SchedulingContext();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 2:
            reader.readMessage(message.env, () =>
              pb_1.Message.addToRepeatedWrapperField(
                message,
                2,
                SchedulingContext.Env.deserialize(reader),
                SchedulingContext.Env
              )
            );
            break;
          case 3:
            message.timeout = reader.readInt32();
            break;
          case 4:
            reader.readMessage(
              message.batch,
              () => (message.batch = SchedulingContext.Batch.deserialize(reader))
            );
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }
  }
  export namespace SchedulingContext {
    export class Env extends pb_1.Message {
      constructor(
        data?:
          | any[]
          | {
              key?: string;
              value?: string;
            }
      ) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
        if (!Array.isArray(data) && typeof data == "object") {
          this.key = data.key;
          this.value = data.value;
        }
      }
      get key(): string {
        return pb_1.Message.getFieldWithDefault(this, 1, undefined) as string;
      }
      set key(value: string) {
        pb_1.Message.setField(this, 1, value);
      }
      get value(): string {
        return pb_1.Message.getFieldWithDefault(this, 2, undefined) as string;
      }
      set value(value: string) {
        pb_1.Message.setField(this, 2, value);
      }
      toObject() {
        return {
          key: this.key,
          value: this.value
        };
      }
      serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
        const writer = w || new pb_1.BinaryWriter();
        if (typeof this.key === "string" && this.key.length) writer.writeString(1, this.key);
        if (typeof this.value === "string" && this.value.length) writer.writeString(2, this.value);
        if (!w) return writer.getResultBuffer();
      }
      serializeBinary(): Uint8Array {
        throw new Error("Method not implemented.");
      }
      static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Env {
        const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
          message = new Env();
        while (reader.nextField()) {
          if (reader.isEndGroup()) break;
          switch (reader.getFieldNumber()) {
            case 1:
              message.key = reader.readString();
              break;
            case 2:
              message.value = reader.readString();
              break;
            default:
              reader.skipField();
          }
        }
        return message;
      }
    }
    export class Batch extends pb_1.Message {
      constructor(
        data?:
          | any[]
          | {
              limit?: number;
              deadline?: number;
            }
      ) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
        if (!Array.isArray(data) && typeof data == "object") {
          this.limit = data.limit;
          this.deadline = data.deadline;
        }
      }
      get limit(): number {
        return pb_1.Message.getFieldWithDefault(this, 1, undefined) as number;
      }
      set limit(value: number) {
        pb_1.Message.setField(this, 1, value);
      }
      get deadline(): number {
        return pb_1.Message.getFieldWithDefault(this, 2, undefined) as number;
      }
      set deadline(value: number) {
        pb_1.Message.setField(this, 2, value);
      }
      toObject() {
        return {
          limit: this.limit,
          deadline: this.deadline
        };
      }
      serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
        const writer = w || new pb_1.BinaryWriter();
        if (this.limit !== undefined) writer.writeUint64(1, this.limit);
        if (this.deadline !== undefined) writer.writeUint64(2, this.deadline);
        if (!w) return writer.getResultBuffer();
      }
      serializeBinary(): Uint8Array {
        throw new Error("Method not implemented.");
      }
      static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Batch {
        const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
          message = new Batch();
        while (reader.nextField()) {
          if (reader.isEndGroup()) break;
          switch (reader.getFieldNumber()) {
            case 1:
              message.limit = reader.readUint64();
              break;
            case 2:
              message.deadline = reader.readUint64();
              break;
            default:
              reader.skipField();
          }
        }
        return message;
      }
    }
  }
  export class Runtime extends pb_1.Message {
    constructor(
      data?:
        | any[]
        | {
            name?: string;
            version?: string;
          }
    ) {
      super();
      pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
      if (!Array.isArray(data) && typeof data == "object") {
        this.name = data.name;
        this.version = data.version;
      }
    }
    get name(): string {
      return pb_1.Message.getFieldWithDefault(this, 1, undefined) as string;
    }
    set name(value: string) {
      pb_1.Message.setField(this, 1, value);
    }
    get version(): string {
      return pb_1.Message.getFieldWithDefault(this, 2, undefined) as string;
    }
    set version(value: string) {
      pb_1.Message.setField(this, 2, value);
    }
    toObject() {
      return {
        name: this.name,
        version: this.version
      };
    }
    serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
      const writer = w || new pb_1.BinaryWriter();
      if (typeof this.name === "string" && this.name.length) writer.writeString(1, this.name);
      if (typeof this.version === "string" && this.version.length)
        writer.writeString(2, this.version);
      if (!w) return writer.getResultBuffer();
    }
    serializeBinary(): Uint8Array {
      throw new Error("Method not implemented.");
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Runtime {
      const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
        message = new Runtime();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 1:
            message.name = reader.readString();
            break;
          case 2:
            message.version = reader.readString();
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }
  }
  export class Target extends pb_1.Message {
    constructor(
      data?:
        | any[]
        | {
            id?: string;
            cwd?: string;
            handler?: string;
            context?: SchedulingContext;
            runtime?: Runtime;
          }
    ) {
      super();
      pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
      if (!Array.isArray(data) && typeof data == "object") {
        this.id = data.id;
        this.cwd = data.cwd;
        this.handler = data.handler;
        this.context = data.context;
        this.runtime = data.runtime;
      }
    }
    get id(): string {
      return pb_1.Message.getFieldWithDefault(this, 1, undefined) as string;
    }
    set id(value: string) {
      pb_1.Message.setField(this, 1, value);
    }
    get cwd(): string {
      return pb_1.Message.getFieldWithDefault(this, 2, undefined) as string;
    }
    set cwd(value: string) {
      pb_1.Message.setField(this, 2, value);
    }
    get handler(): string {
      return pb_1.Message.getFieldWithDefault(this, 3, undefined) as string;
    }
    set handler(value: string) {
      pb_1.Message.setField(this, 3, value);
    }
    get context(): SchedulingContext {
      return pb_1.Message.getWrapperField(this, SchedulingContext, 4) as SchedulingContext;
    }
    set context(value: SchedulingContext) {
      pb_1.Message.setWrapperField(this, 4, value);
    }
    get runtime(): Runtime {
      return pb_1.Message.getWrapperField(this, Runtime, 5) as Runtime;
    }
    set runtime(value: Runtime) {
      pb_1.Message.setWrapperField(this, 5, value);
    }
    toObject() {
      return {
        id: this.id,
        cwd: this.cwd,
        handler: this.handler,
        context: this.context && this.context.toObject(),
        runtime: this.runtime && this.runtime.toObject()
      };
    }
    serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
      const writer = w || new pb_1.BinaryWriter();
      if (typeof this.id === "string" && this.id.length) writer.writeString(1, this.id);
      if (typeof this.cwd === "string" && this.cwd.length) writer.writeString(2, this.cwd);
      if (typeof this.handler === "string" && this.handler.length)
        writer.writeString(3, this.handler);
      if (this.context !== undefined)
        writer.writeMessage(4, this.context, () => this.context.serialize(writer));
      if (this.runtime !== undefined)
        writer.writeMessage(5, this.runtime, () => this.runtime.serialize(writer));
      if (!w) return writer.getResultBuffer();
    }
    serializeBinary(): Uint8Array {
      throw new Error("Method not implemented.");
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Target {
      const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
        message = new Target();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 1:
            message.id = reader.readString();
            break;
          case 2:
            message.cwd = reader.readString();
            break;
          case 3:
            message.handler = reader.readString();
            break;
          case 4:
            reader.readMessage(
              message.context,
              () => (message.context = SchedulingContext.deserialize(reader))
            );
            break;
          case 5:
            reader.readMessage(
              message.runtime,
              () => (message.runtime = Runtime.deserialize(reader))
            );
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }
  }
  export class Event extends pb_1.Message {
    constructor(
      data?:
        | any[]
        | {
            id?: string;
            type?: Type;
            target?: Target;
          }
    ) {
      super();
      pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
      if (!Array.isArray(data) && typeof data == "object") {
        this.id = data.id;
        this.type = data.type;
        this.target = data.target;
      }
    }
    get id(): string {
      return pb_1.Message.getFieldWithDefault(this, 1, undefined) as string;
    }
    set id(value: string) {
      pb_1.Message.setField(this, 1, value);
    }
    get type(): Type {
      return pb_1.Message.getFieldWithDefault(this, 2, undefined) as Type;
    }
    set type(value: Type) {
      pb_1.Message.setField(this, 2, value);
    }
    get target(): Target {
      return pb_1.Message.getWrapperField(this, Target, 3) as Target;
    }
    set target(value: Target) {
      pb_1.Message.setWrapperField(this, 3, value);
    }
    toObject() {
      return {
        id: this.id,
        type: this.type,
        target: this.target && this.target.toObject()
      };
    }
    serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
      const writer = w || new pb_1.BinaryWriter();
      if (typeof this.id === "string" && this.id.length) writer.writeString(1, this.id);
      if (this.type !== undefined) writer.writeEnum(2, this.type);
      if (this.target !== undefined)
        writer.writeMessage(3, this.target, () => this.target.serialize(writer));
      if (!w) return writer.getResultBuffer();
    }
    serializeBinary(): Uint8Array {
      throw new Error("Method not implemented.");
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Event {
      const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
        message = new Event();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 1:
            message.id = reader.readString();
            break;
          case 2:
            message.type = reader.readEnum();
            break;
          case 3:
            reader.readMessage(message.target, () => (message.target = Target.deserialize(reader)));
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }
  }

  export class Pop extends pb_1.Message {
    constructor(
      data?:
        | any[]
        | {
            id?: string;
          }
    ) {
      super();
      pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
      if (!Array.isArray(data) && typeof data == "object") {
        this.id = data.id;
      }
    }
    get id(): string {
      return pb_1.Message.getFieldWithDefault(this, 1, undefined) as string;
    }
    set id(value: string) {
      pb_1.Message.setField(this, 1, value);
    }
    toObject() {
      return {
        id: this.id
      };
    }
    serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
      const writer = w || new pb_1.BinaryWriter();
      if (typeof this.id === "string" && this.id.length) writer.writeString(1, this.id);
      if (!w) return writer.getResultBuffer();
    }
    serializeBinary(): Uint8Array {
      throw new Error("Method not implemented.");
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Pop {
      const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
        message = new Pop();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 1:
            message.id = reader.readString();
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }
  }
  export class Complete extends pb_1.Message {
    constructor(
      data?:
        | any[]
        | {
            id?: string;
            succedded?: boolean;
          }
    ) {
      super();
      pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
      if (!Array.isArray(data) && typeof data == "object") {
        this.id = data.id;
        this.succedded = data.succedded;
      }
    }
    get id(): string {
      return pb_1.Message.getFieldWithDefault(this, 1, undefined) as string;
    }
    set id(value: string) {
      pb_1.Message.setField(this, 1, value);
    }
    get succedded(): boolean {
      return pb_1.Message.getFieldWithDefault(this, 2, undefined) as boolean;
    }
    set succedded(value: boolean) {
      pb_1.Message.setField(this, 2, value);
    }
    toObject() {
      return {
        id: this.id,
        succedded: this.succedded
      };
    }
    serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
      const writer = w || new pb_1.BinaryWriter();
      if (typeof this.id === "string" && this.id.length) writer.writeString(1, this.id);
      if (this.succedded !== undefined) writer.writeBool(2, this.succedded);
      if (!w) return writer.getResultBuffer();
    }
    serializeBinary(): Uint8Array {
      throw new Error("Method not implemented.");
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Complete {
      const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
        message = new Complete();
      while (reader.nextField()) {
        if (reader.isEndGroup()) break;
        switch (reader.getFieldNumber()) {
          case 1:
            message.id = reader.readString();
            break;
          case 2:
            message.succedded = reader.readBool();
            break;
          default:
            reader.skipField();
        }
      }
      return message;
    }
  }
  export namespace Complete {
    export class Result extends pb_1.Message {
      constructor(data?: any[] | {}) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) && data, 0, -1, [], null);
        if (!Array.isArray(data) && typeof data == "object") {
        }
      }
      toObject() {
        return {};
      }
      serialize(w?: pb_1.BinaryWriter): Uint8Array | undefined {
        const writer = w || new pb_1.BinaryWriter();
        if (!w) return writer.getResultBuffer();
      }
      serializeBinary(): Uint8Array {
        throw new Error("Method not implemented.");
      }
      static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Result {
        const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes,
          message = new Result();
        while (reader.nextField()) {
          if (reader.isEndGroup()) break;
          switch (reader.getFieldNumber()) {
            default:
              reader.skipField();
          }
        }
        return message;
      }
    }
  }
  export var Queue = {
    pop: {
      path: "/event.Queue/pop",
      requestStream: false,
      responseStream: false,
      requestType: event.Pop,
      responseType: event.Event,
      requestSerialize: (message: Pop) => Buffer.from(message.serialize()),
      requestDeserialize: (bytes: Buffer) => Pop.deserialize(new Uint8Array(bytes)),
      responseSerialize: (message: Event) => Buffer.from(message.serialize()),
      responseDeserialize: (bytes: Buffer) => Event.deserialize(new Uint8Array(bytes))
    },
    complete: {
      path: "/event.Queue/complete",
      requestStream: false,
      responseStream: false,
      requestType: event.Complete,
      responseType: event.Complete.Result,
      requestSerialize: (message: Complete) => Buffer.from(message.serialize()),
      requestDeserialize: (bytes: Buffer) => Complete.deserialize(new Uint8Array(bytes)),
      responseSerialize: (message: Complete.Result) => Buffer.from(message.serialize()),
      responseDeserialize: (bytes: Buffer) => Complete.Result.deserialize(new Uint8Array(bytes))
    }
  };
  export class QueueClient extends grpc_1.makeGenericClientConstructor(Queue, "Queue", {}) {
    constructor(address: string, credentials: grpc_1.ChannelCredentials) {
      super(address, credentials);
    }
    pop(request: Pop, metadata?: grpc_1.Metadata): Promise<Event> {
      return new Promise((resolve, reject) =>
        super["pop"](request, metadata, (error: grpc_1.ServiceError, response: Event) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        })
      );
    }
  }
}
