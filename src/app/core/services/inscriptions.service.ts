import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Theme {
  title: string;
  name?: string;
  rhythm: string;
  author: string;
  composer?: string;
  style?: string;
}

export interface Member {
  name: string;
  fullName?: string;
  instrument?: string;
  role?: string;
  age?: number;
}

export interface Inscription {
  id: string;
  email: string;
  phone: string;
  category: string;
  subcategory: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  stage_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  dni?: string;
  birth_date?: string;
  age?: number;
  address?: string;
  locality?: string;
  province?: string;
  city?: string;
  bio?: string;
  technical_needs?: string;
  proposal_name?: string;
  choreographer_name?: string;
  style?: string;
  dance_list?: string;
  themes?: Theme[];
  members?: Member[];
  accompanying_persons?: { fullName: string; dni: string }[];
  rider_tecnico?: any;
  // Declarations
  acceptRegulations?: boolean;
  acceptNoPriorWin?: boolean;
  acceptNotJurorOrg?: boolean;
  // Nuevos campos para solista instrumental
  instrumentType?: string;
  instrumentName?: string;
  hasAccompaniment?: boolean;
  accompanimentInstrument?: string;
  accompanimentMusician?: string;
  acceptPurelyInstrumental?: boolean;
  acceptOneInstrument?: boolean;
  acceptNoPrerecorded?: boolean;
  acceptNoInstrumentChange?: boolean;
  // Presentación
  presentation?: string;
  artisticName?: string;
  songsList?: string;
  // Stage plot
  x?: number;
  y?: number;
}

export interface StatusUpdateResponse {
  message: string;
}

export interface InscriptionListResponse {
  data: Inscription[];
  total: number;
  page: number;
  page_size: number;
}

@Injectable({ providedIn: 'root' })
export class InscriptionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inscriptions`;

  getInscriptions(params: {
    page?: number;
    page_size?: number;
    category?: string;
    subcategory?: string;
    status?: string;
  } = {}): Observable<InscriptionListResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.subcategory) httpParams = httpParams.set('subcategory', params.subcategory);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<InscriptionListResponse>(this.apiUrl, { params: httpParams });
  }

  getInscription(id: string): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: string, reason?: string): Observable<StatusUpdateResponse> {
    let params = new HttpParams().set('new_status', status);
    if (reason) params = params.set('reason', reason);
    return this.http.patch<StatusUpdateResponse>(`${this.apiUrl}/${id}/status`, null, { params });
  }
}
