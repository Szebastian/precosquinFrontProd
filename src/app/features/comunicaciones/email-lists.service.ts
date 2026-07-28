import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmailContact {
  email: string;
  name?: string;
  category?: string;
  subcategory?: string;
  status?: string;
}

export interface EmailList {
  id: string;
  organization_id: string;
  name: string;
  emails: EmailContact[];
  source: string;
  created_by: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class EmailListsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  getLists(): Observable<EmailList[]> {
    return this.http.get<EmailList[]>(`${this.apiUrl}/email-lists`);
  }

  saveList(name: string, emails: EmailContact[], source: string): Observable<EmailList> {
    return this.http.post<EmailList>(`${this.apiUrl}/email-lists`, {
      name,
      emails,
      source,
    });
  }

  updateList(id: string, name: string, emails: EmailContact[]): Observable<EmailList> {
    return this.http.put<EmailList>(`${this.apiUrl}/email-lists/${id}`, {
      name,
      emails,
      source: 'manual',
    });
  }

  deleteList(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/email-lists/${id}`);
  }
}
