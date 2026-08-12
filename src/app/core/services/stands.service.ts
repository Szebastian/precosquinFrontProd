import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StandPerson {
  full_name: string;
  dni: string;
  phone: string;
  email: string;
  locality: string;
  province: string;
  represents_company: string;
}

export interface StandInfo {
  stand_type: string;
  stand_name: string;
  description?: string;
  main_products: string;
  instagram?: string;
  website?: string;
}

export interface StandDates {
  days: string[];
  start_time: string;
}

export interface StandEquipment {
  space_size: string;
  brings_structure: string;
  elements: string[];
  table_count?: number;
  chair_count?: number;
}

export interface StandElectricity {
  needs_electricity: string;
  equipment?: string[];
  power_watts?: number;
}

export interface StandGastronomy {
  prepares_food: string;
  food_types?: string[];
  uses_gas?: string;
  gas_details?: { gas_type: string; amount: number };
  has_certification?: string;
  certification_doc_url?: string;
}

export interface CommercialData {
  commercial_modality?: string;
  price_range?: string;
}

export interface StandPersonnel {
  count: number;
  names?: { name: string; id_number: string }[];
}

export interface StandLogistics {
  needs_vehicle?: string;
  vehicle_details?: { vehicle_type: string; plate: string };
  early_access?: string;
  needs_help?: string;
}

export interface StandDocs {
  dni_front_url?: string;
  dni_back_url?: string;
  cuit_url?: string;
  logo_url?: string;
  stand_photos?: string[];
  social_links?: string;
}

export interface StandCreate {
  person: StandPerson;
  info: StandInfo;
  dates: StandDates;
  equipment: StandEquipment;
  electricity: StandElectricity;
  gastronomy?: StandGastronomy;
  commercial?: CommercialData;
  personnel?: StandPersonnel;
  logistics?: StandLogistics;
  docs?: StandDocs;
  observations?: string;
}

export interface Stand {
  id: string;
  status: string;
  person: any;
  info: any;
  dates: any;
  equipment: any;
  electricity: any;
  gastronomy?: any;
  commercial?: any;
  personnel?: any;
  logistics?: any;
  docs?: any;
  observations?: string;
  stand_number?: string;
  location_sector?: string;
  location_size?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface StandListResponse {
  data: Stand[];
  total: number;
  page: number;
  page_size: number;
}

export interface StatusUpdate {
  status: string;
  reason?: string;
}

export interface LocationAssignment {
  stand_number?: string;
  location_sector?: string;
  location_size?: string;
  admin_notes?: string;
}

export interface UploadResponse {
  url: string;
  message: string;
}

export const STAND_STATUS = {
  PENDING: 'PENDIENTE',
  IN_REVIEW: 'EN_REVISION',
  APPROVED: 'APROBADO',
  REJECTED: 'RECHAZADO',
  ASSIGNED: 'ASIGNADO',
  CONFIRMED: 'CONFIRMADO',
  CANCELLED: 'CANCELADO',
} as const;

export const STAND_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En Revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  ASIGNADO: 'Asignado',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
};

export const STAND_TYPE_OPTIONS = [
  { value: 'EXPOSICION', label: 'Stands de Exposición' },
  { value: 'GASTRONOMIA', label: 'Stands de Gastronomía' },
  { value: 'COMERCIAL', label: 'Stands Comerciales' },
  { value: ' ARTISTICO', label: 'Stands Artísticos' },
];

export const SECTOR_OPTIONS = [
  { value: 'norte', label: 'Norte' },
  { value: 'sur', label: 'Sur' },
  { value: 'este', label: 'Este' },
  { value: 'oeste', label: 'Oeste' },
  { value: 'centro', label: 'Centro' },
];

export const SIZE_OPTIONS = [
  { value: '2x2', label: '2x2 (4 m²)' },
  { value: '3x3', label: '3x3 (9 m²)' },
  { value: '4x4', label: '4x4 (16 m²)' },
  { value: '4x5', label: '4x5 (20 m²)' },
  { value: '5x5', label: '5x5 (25 m²)' },
  { value: '5x6', label: '5x6 (30 m²)' },
  { value: '6x6', label: '6x6 (36 m²)' },
];

export const DAY_OPTIONS = [
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
  { value: 'todos', label: 'Todos los días' },
];

export const GASTRONOMY_TYPE_OPTIONS = [
  { value: 'empanadas', label: 'Empanadas' },
  { value: 'asados', label: 'Asados / Parrilla' },
  { value: 'pasteleria', label: 'Pastelería / Dulces' },
  { value: 'comida_rapida', label: 'Comida Rápida' },
  { value: 'bebidas', label: 'Bebidas / Infusiones' },
  { value: 'heladeria', label: 'Heladería' },
  { value: 'otros', label: 'Otros' },
];

export const EQUIPMENT_ELEMENT_OPTIONS = [
  { value: 'carpa', label: 'Carpa / Barandales' },
  { value: 'tarima', label: 'Tarima' },
  { value: 'cama_musical', label: 'Cama musical' },
  { value: 'luces', label: 'Iluminación' },
  { value: 'ganchos', label: 'Ganchos / Estructuras de techo' },
  { value: 'barras', label: 'Barras de vaso / Barra' },
  { value: 'caja_fuerte', label: 'Caja fuerte' },
  { value: 'otros', label: 'Otros' },
];

export const GAS_TYPE_OPTIONS = [
  { value: 'natural', label: 'Gas Natural' },
  { value: 'licuado', label: 'Gas Licuado (GLP)' },
];

export const COMMERCIAL_MODALITY_OPTIONS = [
  { value: 'venta', label: 'Venta directa' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'exhibicion', label: 'Exhibición / Portfolio' },
  { value: 'experiencia', label: 'Experiencia interactiva' },
];

export const PRICE_RANGE_OPTIONS = [
  { value: 'gratis', label: 'Gratis' },
  { value: 'accesible', label: '$ (Accesible: $1.000 - $5.000)' },
  { value: 'medio', label: '$$ (Medio: $5.000 - $15.000)' },
  { value: 'alto', label: '$$$ (Alto: $15.000+)' },
];

export const VEHICLE_TYPE_OPTIONS = [
  { value: 'auto', label: 'Automóvil' },
  { value: 'camioneta', label: 'Camioneta / Furgón' },
  { value: 'camion', label: 'Camión' },
  { value: 'moto', label: 'Moto / Bicicleta' },
];

@Injectable({ providedIn: 'root' })
export class StandsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stands`;

  createStand(stand: StandCreate): Observable<{ id: string; message: string }> {
    return this.http.post<{ id: string; message: string }>(this.apiUrl, stand);
  }

  getStand(id: string): Observable<Stand> {
    return this.http.get<Stand>(`${this.apiUrl}/${id}`);
  }

  listStands(params: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  } = {}): Observable<StandListResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<StandListResponse>(this.apiUrl, { params: httpParams });
  }

  updateStatus(id: string, update: StatusUpdate): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/status`, update);
  }

  assignLocation(id: string, assignment: LocationAssignment): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/location`, assignment);
  }

  deleteStand(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadDocument(
    standId: string,
    file: File,
    docType?: string
  ): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (docType) {
      formData.append('doc_type', docType);
    }

    let params = new HttpParams();
    if (docType) params = params.set('doc_type', docType);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/${standId}/upload`,
      formData,
      { params }
    );
  }

  getPublicUrl(path: string): Observable<{ public_url: string }> {
    return this.http.get<{ public_url: string }>(
      `${environment.apiUrl}/storage/public-url/stands/${path}`
    );
  }
}
