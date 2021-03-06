import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Scheme, SchemeObserver} from "@spica-client/core/layout";
import {Subject} from "rxjs";
import {takeUntil, map, take} from "rxjs/operators";
import {fromEvent} from "rxjs";

@Component({
  selector: "code-editor",
  template: "",
  styleUrls: ["./editor.component.scss"],
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditorComponent), multi: true}
  ]
})
export class EditorComponent
  implements OnInit, OnChanges, OnDestroy, DoCheck, ControlValueAccessor {
  @Output() init = new EventEmitter();
  @Output() save = new EventEmitter();

  @Input() language: string;
  @Input() theme: string;
  @Input() options: any;
  @Input("marker") markers: any[];

  private monaco: typeof import("monaco-editor-core");

  private editorRef: ReturnType<typeof import("monaco-editor-core").editor.create>;
  private dispose = new Subject();
  private disposables: import("monaco-editor-core").IDisposable[] = [];

  private get _options(): any {
    return {
      ...this.options,
      scrollBeyondLastLine: false,
      cursorBlinking: "phase",
      fontLigatures: true,
      fontFamily: "Fira Code",
      lineNumbersMinChars: 2
    };
  }

  private value: string;

  private onTouched = () => {};
  private onChanged = (code: string) => {};

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private zone: NgZone,
    private schemeObserver: SchemeObserver
  ) {
    window["MonacoEnvironment"] = {
      getWorker: () => {
        return new Worker("./editor.worker", {type: "module"});
      }
    };
  }

  writeValue(code: string): void {
    if (this.editorRef) {
      this.editorRef.setValue(code || "");
    } else {
      this.value = code;
    }
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.editorRef) {
      this.editorRef.updateOptions({readOnly: isDisabled});
    }
  }

  changeScheme(isDark: boolean) {
    this.theme = isDark ? "vs-dark" : "vs-light";
    this.monaco.editor.setTheme(this.theme);
  }

  async ngOnInit() {
    if (window["jasmine"]) {
      return;
    }
    this.monaco = await import("monaco-editor-core");
    this.editorRef = this.monaco.editor.create(this.elementRef.nativeElement, this._options);

    this.disposables.push(
      this.editorRef.onDidChangeModelContent(() => this.onChanged(this.editorRef.getValue())),
      this.editorRef.onDidBlurEditorText(() => this.onTouched())
    );

    this.init.emit(this.editorRef);

    this.disposables.push();

    this.editorRef.addCommand(this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KEY_S, () =>
      this.zone.run(() => this.save.emit())
    );

    if (this.value) {
      this.editorRef.setValue(this.value);
    }

    if (this.language) {
      this.monaco.editor.setModelLanguage(this.editorRef.getModel(), this.language);
    }

    if (this.theme) {
      this.monaco.editor.setTheme(this.theme);
    }

    if (this.markers) {
      this.monaco.editor.setModelMarkers(this.editorRef.getModel(), this.language, this.markers);
    }

    this.schemeObserver
      .observe(Scheme.Dark)
      .pipe(takeUntil(this.dispose))
      .subscribe(r => this.changeScheme(r));
  }

  ngDoCheck(): void {
    if (this.editorRef && this.elementRef.nativeElement) {
      const elemrect = this.elementRef.nativeElement.getBoundingClientRect();
      const editorrect = this.editorRef.getLayoutInfo();
      if (
        Math.abs(elemrect.width - editorrect.width) <= 5 ||
        Math.abs(elemrect.height - editorrect.height) <= 5
      ) {
        this.editorRef.layout();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.editorRef) {
      if (changes.language) {
        this.monaco.editor.setModelLanguage(this.editorRef.getModel(), this.language);
      }
      if (changes.theme) {
        this.monaco.editor.setTheme(this.theme);
      }
      if (changes.markers) {
        this.monaco.editor.setModelMarkers(this.editorRef.getModel(), this.language, this.markers);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.editorRef) {
      this.editorRef.dispose();
    }
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.dispose.next();
  }
}
