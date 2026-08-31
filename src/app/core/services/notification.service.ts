import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  penaUnread = signal(0);
  inscripcionesPendientes = signal(0);
}
