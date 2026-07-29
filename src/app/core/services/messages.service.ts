import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inscription_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageCreate {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inscription_id?: string;
}

export interface MessageListResponse {
  data: Message[];
  total: number;
  unread: number;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/messages/`;

  sendMessage(msg: MessageCreate): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, msg);
  }

  getMessages(params: {
    page?: number;
    page_size?: number;
    unread_only?: boolean;
  } = {}): Observable<MessageListResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.unread_only) httpParams = httpParams.set('unread_only', 'true');

    return this.http.get<MessageListResponse>(this.apiUrl, { params: httpParams });
  }

  markAsRead(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}${id}/read`, null);
  }

  deleteMessage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}${id}`);
  }
}
