import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, publicGuard, roleGuard } from './auth.guard';
import { AuthService } from './auth.service';

function mockRoute(data?: Record<string, unknown>): ActivatedRouteSnapshot {
  return { data: data || {} } as unknown as ActivatedRouteSnapshot;
}

function mockState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'auth/login', component: {} as any }, { path: 'panel/dashboard', component: {} as any }])],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should redirect to login when not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute(), mockState('/panel/dashboard')));
    expect(result).toBe(false);
  });

  it('should allow access when authenticated', () => {
    authService['_session'].set({ access_token: 'token', token_type: 'bearer' });
    authService['_profile'].set({
      id: '1', email: 'test@test.com', full_name: 'Test', role: 'admin',
      organization_id: 'org1', is_active: true, permissions: [], last_login_at: '',
    });
    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute(), mockState('/panel/dashboard')));
    expect(result).toBe(true);
  });
});

describe('publicGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'panel/dashboard', component: {} as any }])],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access when not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => publicGuard(mockRoute(), mockState('/')));
    expect(result).toBe(true);
  });

  it('should redirect authenticated user away from public pages', () => {
    authService['_session'].set({ access_token: 'token', token_type: 'bearer' });
    authService['_profile'].set({
      id: '1', email: 'test@test.com', full_name: 'Test', role: 'admin',
      organization_id: 'org1', is_active: true, permissions: [], last_login_at: '',
    });
    const result = TestBed.runInInjectionContext(() => publicGuard(mockRoute(), mockState('/auth/login')));
    expect(result).toBe(false);
  });
});

describe('roleGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'auth/login', component: {} as any }, { path: 'panel/dashboard', component: {} as any }])],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should deny access when not authenticated', () => {
    const guard = roleGuard('admin');
    const result = TestBed.runInInjectionContext(() => guard(mockRoute(), mockState('/panel/dashboard')));
    expect(result).toBe(false);
  });

  it('should deny access when role not allowed', () => {
    authService['_session'].set({ access_token: 'token', token_type: 'bearer' });
    authService['_profile'].set({
      id: '1', email: 'test@test.com', full_name: 'Test', role: 'staff',
      organization_id: 'org1', is_active: true, permissions: [], last_login_at: '',
    });
    const guard = roleGuard('admin');
    const result = TestBed.runInInjectionContext(() => guard(mockRoute(), mockState('/panel/dashboard')));
    expect(result).toBe(false);
  });

  it('should allow access when role matches', () => {
    authService['_session'].set({ access_token: 'token', token_type: 'bearer' });
    authService['_profile'].set({
      id: '1', email: 'test@test.com', full_name: 'Test', role: 'admin',
      organization_id: 'org1', is_active: true, permissions: [], last_login_at: '',
    });
    const guard = roleGuard('admin', 'staff');
    const result = TestBed.runInInjectionContext(() => guard(mockRoute(), mockState('/panel/dashboard')));
    expect(result).toBe(true);
  });
});
