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
  accept_regulations?: boolean;
  accept_no_prior_win?: boolean;
  accept_not_juror_org?: boolean;
  // Nuevos campos para solista instrumental
  instrument_type?: string;
  instrument_name?: string;
  has_accompaniment?: boolean;
  accompaniment_instrument?: string;
  accompaniment_musician?: string;
  accept_purely_instrumental?: boolean;
  accept_one_instrument?: boolean;
  accept_no_prerecorded?: boolean;
  accept_no_instrument_change?: boolean;
  // Presentación
  presentation?: string;
  artistic_name?: string;
  songs_list?: string;
  // Archivos subidos
  dni_front_url?: string;
  dni_back_url?: string;
  promo_photo_url?: string;
  lyrics_url?: string;
  score_url?: string;
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

  deleteInscription(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  bulkDelete(ids: string[]): Observable<{ message: string; deleted: number; not_found: string[] }> {
    return this.http.post<{ message: string; deleted: number; not_found: string[] }>(`${this.apiUrl}/bulk-delete`, { ids });
  }

  getSignedUrl(storagePath: string): Observable<{ signed_url: string }> {
    return this.http.get<{ signed_url: string }>(`${environment.apiUrl}/storage/signed-url/inscriptions/${storagePath}`);
  }

  getPublicUrl(storagePath: string): Observable<{ public_url: string }> {
    return this.http.get<{ public_url: string }>(`${environment.apiUrl}/storage/public-url/inscriptions/${storagePath}`);
  }
}
