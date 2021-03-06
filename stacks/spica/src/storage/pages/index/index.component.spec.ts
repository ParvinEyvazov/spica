import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {HttpEvent, HttpEventType} from "@angular/common/http";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ComponentFixture, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatDialog} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {By} from "@angular/platform-browser";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {RouterTestingModule} from "@angular/router/testing";
import {MatAwareDialogModule, MatClipboardModule} from "@spica-client/material";
import {of} from "rxjs";
import {CanInteractDirectiveTest} from "../../../passport/directives/can-interact.directive";
import {ImageEditorComponent} from "../../components/image-editor/image-editor.component";
import {StorageDialogOverviewDialog} from "../../components/storage-dialog-overview/storage-dialog-overview";
import {StorageViewComponent} from "../../components/storage-view/storage-view.component";
import {StorageService} from "../../storage.service";
import {IndexComponent} from "./index.component";

describe("Storage/IndexComponent", () => {
  let fixture: ComponentFixture<IndexComponent>;
  let storageService: jasmine.SpyObj<Partial<StorageService>>;

  beforeEach(() => {
    storageService = {
      getAll: jasmine.createSpy("getAll").and.returnValue(
        of({
          meta: {total: 10000},
          data: [
            {
              _id: "1",
              name: "test1",
              content: {
                type: "image/png"
              },
              url: "http://example/test.png"
            },

            {
              _id: "3",
              name: "test3",
              content: {
                type: "video/mp4"
              },
              url: "http://example/test3.mp4"
            },
            {
              _id: "2",
              name: "test2",
              content: {
                type: "text/txt"
              },
              url: "http://example/test2.txt"
            }
          ]
        })
      ),
      insertMany: null,
      delete: null
    };
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatMenuModule,
        FormsModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        MatGridListModule,
        MatFormFieldModule,
        MatTooltipModule,
        RouterTestingModule.withRoutes([{path: "1", component: IndexComponent}]),
        MatPaginatorModule,
        MatAwareDialogModule,
        MatClipboardModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: null
          }
        },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: jasmine.createSpy("observe").and.returnValue(of(null)),
            isMatched: jasmine
              .createSpy("isMatched", (arg: any) => {
                return arg == Breakpoints.Medium ? true : false;
              })
              .and.callThrough()
          }
        },
        {
          provide: StorageService,
          useValue: storageService
        }
      ],
      declarations: [IndexComponent, StorageViewComponent, CanInteractDirectiveTest]
    });

    fixture = TestBed.createComponent(IndexComponent);
    fixture.detectChanges(false);
  });

  describe("basic behaviours", () => {
    it("should show name of first data on storage", () => {
      expect(
        fixture.debugElement.query(
          By.css("mat-grid-list mat-grid-tile:nth-child(1) mat-card mat-card-actions mat-label")
        ).nativeElement.textContent
      ).toBe("test1");
    });

    it("should define col number", () => {
      expect(fixture.componentInstance.cols).toBe(
        4,
        "should define this value as 4 if current breakpoint value is Medium"
      );
    });
  });

  describe("actions", () => {
    it("show navigate to the edit page", fakeAsync(() => {
      const openSpy = spyOn(fixture.componentInstance.dialog, "open").and.callThrough();
      fixture.debugElement
        .query(
          By.css("mat-grid-list mat-grid-tile:nth-child(1) mat-card mat-card-actions mat-menu")
        )
        .nativeElement.click();
      fixture.detectChanges(false);

      const editButton = document.body.querySelector("div.mat-menu-content button:nth-of-type(2)");
      expect(
        document.body.querySelector("div.mat-menu-content button:nth-of-type(2)").textContent
      ).toContain("Edit", "should show edit button if this data content type is image");

      (editButton as HTMLElement).click();
      tick(500);
      fixture.detectChanges();

      const lastUpdate = fixture.componentInstance.lastUpdates.get("1");
      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy).toHaveBeenCalledWith(ImageEditorComponent, {
        maxWidth: "80%",
        maxHeight: "80%",
        panelClass: "edit-object",
        data: {
          _id: "1",
          name: "test1",
          content: {
            type: "image/png"
          },
          url: `http://example/test.png?timestamp=${lastUpdate}`
        }
      });
    }));

    it("should show disabled add button while file uploading process in progress", () => {
      const event: HttpEvent<Storage> = {
        type: HttpEventType.UploadProgress,
        loaded: 10,
        total: 100
      };
      const insertSpy = spyOn(fixture.componentInstance["storage"], "insertMany").and.returnValue(
        of(event)
      );
      fixture.componentInstance.uploadStorageMany({} as any);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css("mat-toolbar button:last-of-type")).nativeElement.disabled
      ).toBe(true);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith({} as any);
    });

    it("should complete upload progress", () => {
      const refreshSpy = spyOn(fixture.componentInstance.refresh, "next");
      const insertSpy = spyOn(fixture.componentInstance["storage"], "insertMany").and.returnValue(
        of({type: HttpEventType.Response} as any)
      );

      fixture.componentInstance.uploadStorageMany({} as any);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css("mat-toolbar button:last-of-type")).nativeElement.disabled
      ).toBe(false);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith({} as any);

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.progress).toBe(undefined);
    });

    it("should delete data", fakeAsync(() => {
      const deleleteSpy = spyOn(fixture.componentInstance["storage"], "delete").and.returnValue(
        of(null)
      );

      const refreshSpy = spyOn(fixture.componentInstance.refresh, "next");

      fixture.componentInstance.delete("1");
      tick(500);
      fixture.detectChanges();

      expect(deleleteSpy).toHaveBeenCalledTimes(1);
      expect(deleleteSpy).toHaveBeenCalledWith("1");

      expect(refreshSpy).toHaveBeenCalledTimes(1);
    }));

    it("should open preview", () => {
      const lastUpdate = fixture.componentInstance.lastUpdates.get("1");
      const openSpy = spyOn(fixture.componentInstance.dialog, "open").and.callThrough();
      fixture.debugElement
        .query(
          By.css("mat-grid-list mat-grid-tile:nth-child(1) mat-card mat-card-content storage-view")
        )
        .nativeElement.click();
      fixture.detectChanges();

      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy).toHaveBeenCalledWith(StorageDialogOverviewDialog, {
        maxWidth: "80%",
        maxHeight: "80%",
        panelClass: "preview-object",
        data: {
          _id: "1",
          name: "test1",
          content: {
            type: "image/png"
          },
          url: `http://example/test.png?timestamp=${lastUpdate}`
        }
      });
    });

    it("should clear last update time of objects and call refresh.next", () => {
      const refreshSpy = spyOn(fixture.componentInstance.refresh, "next");

      expect(fixture.componentInstance.lastUpdates.size).toEqual(3);

      fixture.debugElement.query(By.css("mat-toolbar button:nth-child(2)")).nativeElement.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.lastUpdates.size).toEqual(0);
      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });

    describe("sorts", () => {
      beforeEach(() => {
        fixture.debugElement
          .query(By.css("mat-toolbar button:first-of-type"))
          .nativeElement.click();
        fixture.detectChanges(false);
      });

      it("should create parameter to sort descend by name", () => {
        (document.body.querySelector(
          "div.mat-menu-content button:nth-child(1)"
        ) as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sorter).toEqual({
          name: -1
        });
      });

      it("should create parameter to sort ascend by name", () => {
        (document.body.querySelector(
          "div.mat-menu-content button:nth-child(2)"
        ) as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sorter).toEqual({
          name: 1
        });
      });

      it("should create parameter to sort descend by date", () => {
        (document.body.querySelector(
          "div.mat-menu-content button:nth-child(3)"
        ) as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sorter).toEqual({
          _id: -1
        });
      });

      it("should create parameter to sort ascend by name", () => {
        (document.body.querySelector(
          "div.mat-menu-content button:nth-child(4)"
        ) as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sorter).toEqual({
          _id: 1
        });
      });
    });
  });

  describe("pagination", () => {
    let paginator: MatPaginator;

    beforeEach(() => {
      paginator = fixture.debugElement.query(By.directive(MatPaginator)).injector.get(MatPaginator);
    });

    it("it should show paginator size", fakeAsync(() => {
      expect(fixture.componentInstance.paginator.length).toBe(10000);
      expect(
        fixture.debugElement.query(By.css("div.mat-paginator-range-label")).nativeElement
          .textContent
      ).toBe(" 1 – 12 of 10000 ");
    }));
    it("should change page", () => {
      paginator.nextPage();
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.css("div.mat-paginator-range-label")).nativeElement
          .textContent
      ).toBe(" 13 – 24 of 10000 ");
    });
    it("should change page size", () => {
      paginator._changePageSize(24);
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.css("div.mat-paginator-range-label")).nativeElement
          .textContent
      ).toBe(" 1 – 24 of 10000 ");
    });
  });
});
