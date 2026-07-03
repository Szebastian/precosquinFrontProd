import { TestBed } from '@angular/core/testing';
import { BackToTopComponent } from './back-to-top.component';

describe('BackToTopComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BackToTopComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not be visible initially', () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('should show button when scrolled past 400px', () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    const comp = fixture.componentInstance;

    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    comp.onScroll();
    expect(comp.visible()).toBe(true);
  });

  it('should hide button when scrolled back up', () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    const comp = fixture.componentInstance;

    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    comp.onScroll();
    expect(comp.visible()).toBe(true);

    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    comp.onScroll();
    expect(comp.visible()).toBe(false);
  });

  it('should not render button when not visible', () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.back-to-top')).toBeNull();
  });

  it('should render button when visible', () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.back-to-top')).toBeTruthy();
  });

  it('should have aria-label for accessibility', () => {
    const fixture = TestBed.createComponent(BackToTopComponent);
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.back-to-top') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Volver arriba');
  });
});
