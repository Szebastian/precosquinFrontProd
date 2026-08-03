import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  AccreditationParticipant,
  AccreditationListResponse,
  AccreditationStats,
  CheckInResult,
  AuditLogEntry,
} from '../models/acreditaciones.models';

@Injectable({ providedIn: 'root' })
export class AcreditacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/acreditaciones`;

  checkInByQR(qrCode: string) {
    return this.http.post<CheckInResult>(`${this.apiUrl}/checkin/qr`, { qrCode });
  }

  checkInByDNI(dni: string) {
    return this.http.post<CheckInResult>(`${this.apiUrl}/checkin/dni`, { dni });
  }

  accredit(participantId: string, operator: string, method: 'qr' | 'dni') {
    return this.http.patch<AccreditationParticipant>(`${this.apiUrl}/${participantId}/accredit`, { operator, method });
  }

  getParticipants(params: {
    search?: string;
    status?: string;
    category?: string;
    stage?: string;
    schedule?: string;
    province?: string;
    page?: number;
    page_size?: number;
  }) {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.stage) httpParams = httpParams.set('stage', params.stage);
    if (params.schedule) httpParams = httpParams.set('schedule', params.schedule);
    if (params.province) httpParams = httpParams.set('province', params.province);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());

    return this.http.get<AccreditationListResponse>(this.apiUrl, { params: httpParams });
  }

  getStats() {
    return this.http.get<AccreditationStats>(`${this.apiUrl}/stats`);
  }

  getAuditLog(params?: { participantId?: string; page?: number; page_size?: number }) {
    let httpParams = new HttpParams();
    if (params?.participantId) httpParams = httpParams.set('participantId', params.participantId);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());

    return this.http.get<{ data: AuditLogEntry[]; total: number }>(`${this.apiUrl}/audit-log`, { params: httpParams });
  }
}
