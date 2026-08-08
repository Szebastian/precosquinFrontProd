import { Component, ChangeDetectionStrategy, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-curved-loop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="curved-loop" [class.curved-loop--ready]="ready()">
      <svg [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight" preserveAspectRatio="none">
        <defs>
          <path #curvePath [attr.d]="pathD" fill="none" />
        </defs>
        <text class="curved-text" [attr.fill]="color" [attr.font-size]="fontSize" [attr.font-weight]="fontWeight" [attr.letter-spacing]="letterSpacing">
          <textPath #textPathEl [attr.href]="'#' + pathId" [attr.startOffset]="'0px'">
            {{ repeatText }}
          </textPath>
        </text>
        <!-- hidden measure element -->
        <text #measureEl [attr.fill]="color" [attr.font-size]="fontSize" [attr.font-weight]="fontWeight" [attr.letter-spacing]="letterSpacing" visibility="hidden">
          {{ text }}
        </text>
      </svg>
      <svg class="curved-svg-id" width="0" height="0">
        <path [attr.id]="pathId" [attr.d]="pathD" />
      </svg>
    </div>
  `,
  styles: [`
    .curved-loop {
      width: 100%;
      overflow: hidden;
      line-height: 0;
    }

    .curved-loop svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .curved-svg-id {
      position: absolute;
      width: 0;
      height: 0;
      overflow: hidden;
    }

    .curved-text {
      font-family: var(--font-display);
    }
  `]
})
export class CurvedLoopComponent implements AfterViewInit, OnDestroy {
  @Input() text = '✦ CATEGORÍAS ';
  @Input() speed = 2;
  @Input() curveAmount = 120;
  @Input() direction: 'left' | 'right' = 'left';
  @Input() fontSize = 42;
  @Input() fontWeight = 800;
  @Input() letterSpacing = 2;
  @Input() color = 'rgba(255,255,255,0.12)';
  @Input() svgWidth = 1200;
  @Input() svgHeight = 200;
  @Input() separator = ' ✦ ';

  @ViewChild('textPathEl') textPathRef!: ElementRef<SVGTextPathElement>;
  @ViewChild('measureEl') measureRef!: ElementRef<SVGTextElement>;

  ready = signal(false);
  pathId = 'curved-path-' + Math.random().toString(36).slice(2, 9);

  private animFrame = 0;
  private spacing = 0;
  private dir: 'left' | 'right' = 'left';

  get pathD(): string {
    const midY = 40 + this.curveAmount;
    return `M-100,40 Q${this.svgWidth / 2},${midY} ${this.svgWidth + 100},40`;
  }

  get repeatText(): string {
    return this.text + this.separator;
  }

  ngAfterViewInit(): void {
    this.dir = this.direction;
    setTimeout(() => this.init());
  }

  private init(): void {
    const measureEl = this.measureRef?.nativeElement;
    const textPathEl = this.textPathRef?.nativeElement;
    if (!measureEl || !textPathEl) return;

    this.spacing = measureEl.getComputedTextLength();
    this.ready.set(true);
    this.loop(textPathEl);
  }

  private loop(el: SVGTextPathElement): void {
    const step = () => {
      const current = parseFloat(el.getAttribute('startOffset') || '0');
      const delta = this.dir === 'right' ? this.speed : -this.speed;
      let next = current + delta;

      if (next <= -this.spacing) next += this.spacing;
      if (next > 0) next -= this.spacing;

      el.setAttribute('startOffset', next + 'px');
      this.animFrame = requestAnimationFrame(step);
    };
    this.animFrame = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrame);
  }
}
