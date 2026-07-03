import { TestBed } from '@angular/core/testing';
import { SkeletonCardComponent } from './skeleton-card.component';

describe('SkeletonCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SkeletonCardComponent],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SkeletonCardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have default lines of 3', () => {
    const fixture = TestBed.createComponent(SkeletonCardComponent);
    expect(fixture.componentInstance.lines()).toBe(3);
  });

  it('should generate correct lineArray for default lines', () => {
    const fixture = TestBed.createComponent(SkeletonCardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.lineArray()).toEqual([0, 1, 2]);
  });
});
