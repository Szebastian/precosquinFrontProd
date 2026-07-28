import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailContact } from './email-lists.service';

export type EmailTemplate =
  | 'inscripcion_confirmada'
  | 'notificacion_masiva'
  | 'recordatorio_fechas'
  | 'sponsor'
  | 'personalizado';

export interface SendEmailRequest {
  recipients: EmailContact[];
  subject: string;
  body: string;
  template?: EmailTemplate;
  logo_url?: string;
}

export interface SendEmailResponse {
  message: string;
  sent: number;
  failed: number;
}

export interface ScheduleEmailRequest {
  recipients: EmailContact[];
  subject: string;
  body: string;
  template?: EmailTemplate;
  scheduled_at?: string;
  logo_url?: string;
}

export interface ScheduleEmailResponse {
  message: string;
  job_id: string;
}

export interface EmailJob {
  id: string;
  organization_id: string;
  subject: string;
  body: string;
  template: string;
  recipients: EmailContact[];
  scheduled_at: string | null;
  status: string;
  sent: number;
  failed: number;
  created_by: string;
  created_at: string;
}

export interface EmailJobsResponse {
  data: EmailJob[];
}

@Injectable({ providedIn: 'root' })
export class ComunicacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/communications`;

  sendEmail(request: SendEmailRequest): Observable<SendEmailResponse> {
    return this.http.post<SendEmailResponse>(`${this.apiUrl}/send`, request);
  }

  scheduleEmail(request: ScheduleEmailRequest): Observable<ScheduleEmailResponse> {
    return this.http.post<ScheduleEmailResponse>(`${this.apiUrl}/schedule`, request);
  }

  getJobs(): Observable<EmailJobsResponse> {
    return this.http.get<EmailJobsResponse>(`${this.apiUrl}/jobs`);
  }

  uploadLogo(file: File): Observable<string> {
    const storageUrl = environment.supabaseUrl;
    const path = `email-logos/${Date.now()}_${file.name}`;
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<{ path: string }>(`${environment.apiUrl}/storage/upload/logos/${path}`, formData)
      .pipe(
        map(() => `${storageUrl}/storage/v1/object/public/logos/${path}`)
      );
  }
}
