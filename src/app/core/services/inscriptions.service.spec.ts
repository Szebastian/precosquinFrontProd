import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InscriptionsService } from './inscriptions.service';

describe('InscriptionsService', () => {
  let service: InscriptionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InscriptionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get inscriptions with default params', () => {
    service.getInscriptions().subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/inscriptions'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], total: 0, page: 1, page_size: 10 });
  });

  it('should get inscriptions with filters', () => {
    service.getInscriptions({ page: 2, page_size: 5, category: 'solista', status: 'aprobada' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/inscriptions'));
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('page_size')).toBe('5');
    expect(req.request.params.get('category')).toBe('solista');
    expect(req.request.params.get('status')).toBe('aprobada');
    req.flush({ data: [], total: 0, page: 2, page_size: 5 });
  });

  it('should get a single inscription', () => {
    const mockInscription = { id: '123', email: 'test@test.com', full_name: 'Test', status: 'pendiente' };
    service.getInscription('123').subscribe(result => {
      expect(result.id).toBe('123');
    });

    const req = httpMock.expectOne(r => r.url.includes('/inscriptions/123'));
    expect(req.request.method).toBe('GET');
    req.flush(mockInscription);
  });

  it('should update inscription status', () => {
    service.updateStatus('123', 'aprobada', 'Cumple requisitos').subscribe(result => {
      expect(result.message).toBeTruthy();
    });

    const req = httpMock.expectOne(r => r.url.includes('/inscriptions/123/status'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('new_status')).toBe('aprobada');
    expect(req.request.params.get('reason')).toBe('Cumple requisitos');
    req.flush({ message: 'Estado actualizado' });
  });

  it('should update status without reason', () => {
    service.updateStatus('456', 'rechazada').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/inscriptions/456/status'));
    expect(req.request.params.get('new_status')).toBe('rechazada');
    expect(req.request.params.has('reason')).toBe(false);
    req.flush({ message: 'OK' });
  });
});
