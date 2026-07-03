import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty toasts initially', () => {
    expect(service.toasts().length).toBe(0);
  });

  it('should add a success toast', () => {
    service.success('Title', 'Message');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('success');
    expect(service.toasts()[0].title).toBe('Title');
    expect(service.toasts()[0].message).toBe('Message');
  });

  it('should add an error toast with longer duration', () => {
    service.error('Error', 'Something failed');
    expect(service.toasts()[0].type).toBe('error');
    expect(service.toasts()[0].duration).toBe(8000);
  });

  it('should add a warning toast', () => {
    service.warning('Warning');
    expect(service.toasts()[0].type).toBe('warning');
    expect(service.toasts()[0].duration).toBe(5000);
  });

  it('should add an info toast', () => {
    service.info('Info');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should remove a toast by id', () => {
    service.success('First');
    service.success('Second');
    expect(service.toasts().length).toBe(2);
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].title).toBe('Second');
  });

  it('should clear all toasts', () => {
    service.success('A');
    service.error('B');
    service.warning('C');
    expect(service.toasts().length).toBe(3);
    service.clear();
    expect(service.toasts().length).toBe(0);
  });

  it('should generate unique ids', () => {
    service.success('A');
    service.success('B');
    expect(service.toasts()[0].id).not.toBe(service.toasts()[1].id);
  });

  it('should respect custom duration', () => {
    service.success('Custom', undefined, { duration: 2000 });
    expect(service.toasts()[0].duration).toBe(2000);
  });
});
