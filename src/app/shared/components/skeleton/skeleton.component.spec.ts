import { TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have correct default inputs', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    const comp = fixture.componentInstance;
    expect(comp.width()).toBe('100%');
    expect(comp.height()).toBe('1rem');
    expect(comp.circle()).toBe(false);
    expect(comp.wave()).toBe(false);
    expect(comp.borderRadius()).toBe('var(--radius-md)');
    expect(comp.duration()).toBe('1.5s');
  });

  it('should render a div with skeleton class', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const div = el.querySelector('.skeleton');
    expect(div).toBeTruthy();
  });
});
