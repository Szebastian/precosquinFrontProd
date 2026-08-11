import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export type UserRole = 'organizador' | 'admin' | 'staff' | 'jurado';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  avatar_url?: string;
  is_active: boolean;
  permissions: string[];
  last_login_at: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _session = signal<AuthSession | null>(null);
  private _profile = signal<UserProfile | null>(null);
  private _loading = signal(false);

  readonly session = this._session.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isAuthenticated = computed(() => !!this._session());
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');
  readonly isOrganizador = computed(() => this._profile()?.role === 'organizador');
  readonly isStaff = computed(() => this._profile()?.role === 'staff');
  readonly isJurado = computed(() => this._profile()?.role === 'jurado');
  readonly currentOrgId = computed(() => this._profile()?.organization_id);

  async login(email: string, password: string): Promise<{ error: string | null }> {
    this._loading.set(true);
    try {
      const data = await this.http.post<AuthSession>(`${environment.apiUrl}/auth/login`, { email, password }).toPromise();
      this._session.set(data ?? null);
      await this.loadProfile();
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      return { error: message };
    } finally {
      this._loading.set(false);
    }
  }

  async loadProfile(): Promise<void> {
    const session = this._session();
    if (!session?.access_token) return;

    try {
      const profile = await this.http.get<UserProfile>(`${environment.apiUrl}/auth/profile`).toPromise();
      this._profile.set(profile ?? null);
    } catch {
      this._decodeProfileFromToken(session.access_token);
    }
  }

  private _decodeProfileFromToken(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const metadata = payload.user_metadata || payload.app_metadata || {};
      this._profile.set({
        id: payload.sub,
        email: payload.email || '',
        full_name: metadata.full_name || '',
        role: (metadata.role || payload.role || 'staff') as UserRole,
        organization_id: metadata.organization_id || null,
        is_active: true,
        permissions: metadata.permissions || [],
        last_login_at: '',
      });
    } catch {
      this._profile.set(null);
    }
  }

  async logout(): Promise<void> {
    this._session.set(null);
    this._profile.set(null);
    await this.router.navigate(['/auth/login']);
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this._profile()?.role ?? '');
  }
}
