import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PresentationItem,
  AgendaEvent,
  PresentationListResponse,
  AgendaListResponse,
} from '../models/cronograma.models';

@Injectable({ providedIn: 'root' })
export class CronogramaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cronograma`;

  getPresentations(params: {
    search?: string;
    category?: string;
    subcategory?: string;
    stage?: string;
    day?: string;
    page?: number;
    page_size?: number;
  } = {}): Observable<PresentationListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.subcategory) httpParams = httpParams.set('subcategory', params.subcategory);
    if (params.stage) httpParams = httpParams.set('stage', params.stage);
    if (params.day) httpParams = httpParams.set('day', params.day);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());

    return this.http.get<PresentationListResponse>(`${this.apiUrl}/presentations`, { params: httpParams });
  }

  getPresentation(id: string): Observable<PresentationItem> {
    return this.http.get<PresentationItem>(`${this.apiUrl}/presentations/${id}`);
  }

  getAgenda(params: {
    search?: string;
    day?: string;
    eventType?: string;
    page?: number;
    page_size?: number;
  } = {}): Observable<AgendaListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.day) httpParams = httpParams.set('day', params.day);
    if (params.eventType) httpParams = httpParams.set('event_type', params.eventType);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());

    return this.http.get<AgendaListResponse>(`${this.apiUrl}/agenda`, { params: httpParams });
  }

  getAgendaEvent(id: string): Observable<AgendaEvent> {
    return this.http.get<AgendaEvent>(`${this.apiUrl}/agenda/${id}`);
  }
}
