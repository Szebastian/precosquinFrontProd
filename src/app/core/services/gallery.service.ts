import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface GalleryItemCreate {
  image: string;
  title: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/gallery/`;

  getGallery(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(this.apiUrl);
  }

  getGalleryItem(id: number): Observable<GalleryItem> {
    return this.http.get<GalleryItem>(`${this.apiUrl}${id}`);
  }

  createGalleryItem(item: GalleryItemCreate): Observable<GalleryItem> {
    return this.http.post<GalleryItem>(this.apiUrl, item);
  }

  updateGalleryItem(id: number, item: Partial<GalleryItemCreate>): Observable<GalleryItem> {
    return this.http.put<GalleryItem>(`${this.apiUrl}${id}`, item);
  }

  deleteGalleryItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}`);
  }

  bulkCreateGalleryItems(items: GalleryItemCreate[]): Observable<GalleryItem[]> {
    return this.http.post<GalleryItem[]>(`${this.apiUrl}bulk`, { items });
  }
}
