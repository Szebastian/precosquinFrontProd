import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { tap, catchError, of, EMPTY } from 'rxjs';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  pricing_engine_config: Record<string, unknown>;
  notification_prefs: Record<string, unknown>;
  integration_config: Record<string, unknown>;
  feature_flags: Record<string, boolean>;
  retention_days: number;
}

@Injectable({ providedIn: 'root' })
export class OrganizationStore {
  private http = inject(HttpClient);
  private _organizations = signal<Organization[]>([]);
  private _currentOrg = signal<Organization | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly organizations = this._organizations.asReadonly();
  readonly currentOrg = this._currentOrg.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly currentOrgId = computed(() => this._currentOrg()?.id);
  readonly currentOrgName = computed(() => this._currentOrg()?.name);
  readonly currentOrgSettings = computed(() => this._currentOrg()?.settings);
  readonly featureFlags = computed(() => this._currentOrg()?.settings?.feature_flags ?? {});

  async loadOrganizations(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const orgs = await this.http
        .get<Organization[]>(`${environment.apiUrl}/organizations`)
        .pipe(
          catchError((err) => {
            this._error.set(err.message);
            return EMPTY;
          })
        )
        .toPromise();

      if (orgs) {
        this._organizations.set(orgs);
        const storedOrgId = localStorage.getItem('currentOrgId');
        const org = orgs.find(o => o.id === storedOrgId) ?? orgs[0];
        if (org) this._currentOrg.set(org);
      }
    } finally {
      this._loading.set(false);
    }
  }

  switchOrganization(orgId: string): void {
    const org = this._organizations().find(o => o.id === orgId);
    if (org) {
      this._currentOrg.set(org);
      localStorage.setItem('currentOrgId', orgId);
    }
  }

  async updateSettings(settings: Partial<OrganizationSettings>): Promise<void> {
    const org = this._currentOrg();
    if (!org) return;

    try {
      const updated = await this.http
        .patch<Organization>(`${environment.apiUrl}/organizations/${org.id}/settings`, settings)
        .toPromise();

      if (updated) {
        this._currentOrg.set(updated);
        const idx = this._organizations().findIndex(o => o.id === org.id);
        if (idx >= 0) {
          this._organizations.update(orgs => {
            const newOrgs = [...orgs];
            newOrgs[idx] = updated;
            return newOrgs;
          });
        }
      }
    } catch (error) {
      this._error.set('Error actualizando configuración');
      throw error;
    }
  }

  hasFeatureFlag(flag: string): boolean {
    return this.featureFlags()[flag] === true;
  }
}