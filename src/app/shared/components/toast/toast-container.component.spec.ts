import { TestBed } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from './toast.service';

describe('ToastContainerComponent', () => {
  let toastService: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    });
    toastService = TestBed.inject(ToastService);
    toastService.clear();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render no toast items initially', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.toast').length).toBe(0);
  });

  it('should render toast when added', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    toastService.success('Test Toast');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.toast').length).toBe(1);
  });

  it('should render correct type class', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    toastService.error('Error Toast');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const toast = el.querySelector('.toast');
    expect(toast?.classList.contains('toast-error')).toBe(true);
  });

  it('should remove toast on close button click', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    toastService.success('Closeable');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(1);

    const closeBtn = fixture.nativeElement.querySelector('.toast-close') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(0);
  });
});
