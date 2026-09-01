import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SorteoCreate {
  ticket_option: string;
  full_name: string;
  whatsapp: string;
  email: string;
  province?: string;
  city: string;
  comprobante_numero?: string;
}

export interface SorteoResponse {
  id: string;
  ticket_option: string;
  full_name: string;
  whatsapp: string;
  email: string;
  province?: string;
  city: string;
  comprobante_url?: string;
  comprobante_numero?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SorteoListResponse {
  data: SorteoResponse[];
  total: number;
  page: number;
  page_size: number;
}

@Injectable({ providedIn: 'root' })
export class SorteoAvistajeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sorteo-avistaje`;

  create(data: SorteoCreate): Observable<{ id: string; message: string }> {
    return this.http.post<{ id: string; message: string }>(this.apiUrl, data);
  }

  uploadComprobante(sorteoId: string, file: File): Observable<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.patch<{ url: string; message: string }>(
      `${this.apiUrl}/${sorteoId}/comprobante`,
      formData
    );
  }

  list(params: { page?: number; page_size?: number; status?: string; search?: string } = {}): Observable<SorteoListResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<SorteoListResponse>(this.apiUrl, { params: httpParams });
  }

  updateStatus(id: string, status: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/${id}/status`,
      null,
      { params: new HttpParams().set('status', status) }
    );
  }
}
