import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmailTemplateRecord {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  variables: string[];
  status: string;
  created_by: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class EmailTemplatesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications/templates`;

  getTemplates(): Observable<EmailTemplateRecord[]> {
    return this.http.get<EmailTemplateRecord[]>(this.apiUrl);
  }

  saveTemplate(name: string, subject: string, body: string): Observable<EmailTemplateRecord> {
    return this.http.post<EmailTemplateRecord>(this.apiUrl, {
      name,
      channel: 'email',
      subject,
      body,
      variables: this.extractVariables(body + ' ' + subject),
    });
  }

  updateTemplate(id: string, name: string, subject: string, body: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, {
      name,
      subject,
      body,
      variables: this.extractVariables(body + ' ' + subject),
    });
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private extractVariables(text: string): string[] {
    const matches = text.match(/\{[a-z_]+\}/g) || [];
    return [...new Set(matches)];
  }
}
