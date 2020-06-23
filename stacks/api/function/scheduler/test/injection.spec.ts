import {Global, INestApplication, Module} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {ENQUEUER, Scheduler, SchedulerModule} from "@spica-server/function/scheduler";
import {DatabaseTestingModule} from "@spica-server/database/testing";

process.env.FUNCTION_GRPC_ADDRESS = "0.0.0.0:7911";

const spyScheduler = jasmine
  .createSpy("schedulerSpy")
  .and.returnValue({enqueuer: null, queue: null});

@Global()
@Module({
  providers: [
    {
      provide: ENQUEUER,
      useValue: spyScheduler
    }
  ],
  exports: [ENQUEUER]
})
export class SpySchedulerModule {}

describe("Scheduler injects enqueuer", () => {
  let module: TestingModule;
  let scheduler: Scheduler;
  let app: INestApplication;

  let addQueueSpy: jasmine.Spy;
  let addEnqueuerSpy: jasmine.Spy;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        DatabaseTestingModule.replicaSet(),
        SchedulerModule.forRoot({
          databaseName: undefined,
          databaseReplicaSet: undefined,
          databaseUri: undefined,
          poolSize: 10,
          publicUrl: undefined,
          timeout: 60000
        }),
        SpySchedulerModule
      ]
    }).compile();
    app = module.createNestApplication();
    scheduler = module.get(Scheduler);
    addQueueSpy = spyOn(scheduler["queue"], "addQueue");
    addEnqueuerSpy = spyOn(scheduler.enqueuers, "add");
    await app.init();
  });

  afterEach(() => module.close());

  it("should inject the provided enqueuer and queue", async () => {
    expect(spyScheduler).toHaveBeenCalledTimes(1);
    expect(spyScheduler).toHaveBeenCalledWith(scheduler["queue"]);

    expect(addQueueSpy).toHaveBeenCalledTimes(1);
    expect(addQueueSpy).toHaveBeenCalledWith(null);
  });
});