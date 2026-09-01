import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  link_url: string | null;
  category: 'sponsor' | 'colaborador';
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class PartnersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/partners`;

  /** Public list (active only) */
  getPublicList(category?: 'sponsor' | 'colaborador'): Observable<{ data: Partner[]; total: number }> {
    let params: Record<string, string> = {};
    if (category) params['category'] = category;
    return this.http.get<{ data: Partner[]; total: number }>(this.base, { params });
  }

  /** Admin list (all) */
  getAllList(): Observable<{ data: Partner[]; total: number }> {
    return this.http.get<{ data: Partner[]; total: number }>(`${this.base}/all`);
  }

  /** Create */
  create(data: Partial<Partner>): Observable<Partner> {
    return this.http.post<Partner>(this.base, data);
  }

  /** Update */
  update(id: string, data: Partial<Partner>): Observable<Partner> {
    return this.http.put<Partner>(`${this.base}/${id}`, data);
  }

  /** Delete */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  /** Reorder */
  reorder(id: string, newOrder: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/${id}/reorder`, null, { params: { order: newOrder.toString() } });
  }
}
