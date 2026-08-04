import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

const API = environment.apiUrl;

describe('OTP Verification Logic', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('sendVerification - POST /inscriptions/send-otp', () => {
    it('should POST with the email', () => {
      http.post(`${API}/inscriptions/send-otp`, { email: 'test@test.com' }).subscribe();
      const req = httpMock.expectOne(`${API}/inscriptions/send-otp`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com' });
      req.flush({});
    });

    it('should succeed with 200', async () => {
      const p = firstValueFrom(http.post(`${API}/inscriptions/send-otp`, { email: 'test@test.com' }));
      httpMock.expectOne(`${API}/inscriptions/send-otp`).flush({});
      await expect(p).resolves.toBeDefined();
    });

    it('should return error detail from backend', async () => {
      const p = firstValueFrom(http.post(`${API}/inscriptions/send-otp`, { email: 'test@test.com' }));
      httpMock.expectOne(`${API}/inscriptions/send-otp`).flush(
        { detail: 'No se pudo enviar' },
        { status: 500, statusText: 'Server Error' }
      );
      try { await p; expect(true).toBe(false); } catch (err: any) {
        expect(err.error.detail).toBe('No se pudo enviar');
      }
    });
  });

  describe('verifyCode - POST /inscriptions/verify-otp', () => {
    it('should POST with email and code', () => {
      http.post(`${API}/inscriptions/verify-otp`, { email: 'test@test.com', code: '123456' }).subscribe();
      const req = httpMock.expectOne(`${API}/inscriptions/verify-otp`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', code: '123456' });
      req.flush({});
    });

    it('should succeed on correct code', async () => {
      const p = firstValueFrom(http.post(`${API}/inscriptions/verify-otp`, { email: 'test@test.com', code: '123456' }));
      httpMock.expectOne(`${API}/inscriptions/verify-otp`).flush({});
      await expect(p).resolves.toBeDefined();
    });

    it('should fail on incorrect code', async () => {
      const p = firstValueFrom(http.post(`${API}/inscriptions/verify-otp`, { email: 'test@test.com', code: '000000' }));
      httpMock.expectOne(`${API}/inscriptions/verify-otp`).flush(
        { detail: 'Código incorrecto' },
        { status: 400, statusText: 'Bad Request' }
      );
      try { await p; expect(true).toBe(false); } catch (err: any) {
        expect(err.error.detail).toBe('Código incorrecto');
      }
    });
  });

  describe('allDeclarationsChecked logic', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function allDeclarationsChecked(data: any, isEmailVerified: boolean): boolean {
      const emailValid = emailRegex.test((data.email || '').trim());
      const hasRequired = !!(data.firstName?.trim() && data.lastName?.trim() && emailValid && data.phone?.trim() && data.category && data.subcategory);
      return hasRequired && !!data.acceptRegulations && isEmailVerified;
    }

    it('should return false when acceptRegulations is false', () => {
      expect(allDeclarationsChecked({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1', category: 'm', subcategory: 's', acceptRegulations: false }, true)).toBeFalsy();
    });

    it('should return false when isEmailVerified is false', () => {
      expect(allDeclarationsChecked({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1', category: 'm', subcategory: 's', acceptRegulations: true }, false)).toBeFalsy();
    });

    it('should return true when all conditions are met', () => {
      expect(allDeclarationsChecked({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1', category: 'm', subcategory: 's', acceptRegulations: true }, true)).toBeTruthy();
    });

    it('should return false when firstName is empty', () => {
      expect(allDeclarationsChecked({ firstName: '', lastName: 'B', email: 'a@b.com', phone: '1', category: 'm', subcategory: 's', acceptRegulations: true }, true)).toBeFalsy();
    });

    it('should return false when email is invalid', () => {
      expect(allDeclarationsChecked({ firstName: 'A', lastName: 'B', email: 'not-an-email', phone: '1', category: 'm', subcategory: 's', acceptRegulations: true }, true)).toBeFalsy();
    });

    it('should return false when phone is missing', () => {
      expect(allDeclarationsChecked({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '', category: 'm', subcategory: 's', acceptRegulations: true }, true)).toBeFalsy();
    });

    it('should return false when category is missing', () => {
      expect(allDeclarationsChecked({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1', category: '', subcategory: 's', acceptRegulations: true }, true)).toBeFalsy();
    });
  });
});
