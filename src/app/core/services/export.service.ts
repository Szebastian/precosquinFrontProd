import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Inscription } from './inscriptions.service';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {

  private readonly LIST_COLUMNS: ExportColumn[] = [
    { header: 'ID', key: 'id', width: 12 },
    { header: 'Sede', key: 'sede', width: 14 },
    { header: 'Rubro', key: 'category', width: 16 },
    { header: 'Sub-rubro', key: 'subcategory', width: 20 },
    { header: 'Nombre / Conjunto', key: 'full_name', width: 30 },
    { header: 'Nombre Artístico', key: 'stage_name', width: 24 },
    { header: 'DNI Titular', key: 'dni', width: 14 },
    { header: 'Fecha Nac.', key: 'birth_date', width: 14 },
    { header: 'Edad', key: 'age', width: 8 },
    { header: 'Localidad', key: 'locality', width: 20 },
    { header: 'Provincia', key: 'province', width: 18 },
    { header: 'Teléfono', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Cant. Integrantes', key: 'memberCount', width: 8 },
    { header: 'Nómina Integrantes (DNI)', key: 'membersDni', width: 30 },
    { header: 'Repertorio Declarado', key: 'repertoire', width: 40 },
    { header: 'Estado Documental', key: 'docStatus', width: 18 },
    { header: 'Estado Inscripción', key: 'status', width: 18 },
  ];

  exportListToExcel(
    inscriptions: Inscription[],
    filename: string = 'inscripciones-precosquin',
    separateByCategory: boolean = true
  ): void {
    if (!inscriptions.length) return;

    const workbook = XLSX.utils.book_new();

    if (separateByCategory) {
      const musica = inscriptions.filter(i => i.category === 'Música');
      const danza = inscriptions.filter(i => i.category === 'Danza');
      const other = inscriptions.filter(i => i.category !== 'Música' && i.category !== 'Danza');

      if (musica.length) {
        const ws = this.buildSheet(musica);
        XLSX.utils.book_append_sheet(workbook, ws, 'Música');
      }
      if (danza.length) {
        const ws = this.buildSheet(danza);
        XLSX.utils.book_append_sheet(workbook, ws, 'Danza');
      }
      if (other.length) {
        const ws = this.buildSheet(other);
        XLSX.utils.book_append_sheet(workbook, ws, 'Otros');
      }
    } else {
      const ws = this.buildSheet(inscriptions);
      XLSX.utils.book_append_sheet(workbook, ws, 'Inscripciones');
    }

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  exportSingleProfile(inscription: Inscription, filename?: string): void {
    const workbook = XLSX.utils.book_new();

    const profileData = [
      ['FICHA DE INSCRIPTO - PRE COSQUÍN'],
      [],
      ['DATOS GENERALES'],
      ['ID', inscription.id],
      ['Nombre / Conjunto', inscription.full_name],
      ['Nombre Artístico', inscription.stage_name || '-'],
      ['Rubro', inscription.category],
      ['Sub-rubro', inscription.subcategory],
      ['Sede de Origen', inscription.city || inscription.locality || '-'],
      ['Estado', this.formatStatus(inscription.status)],
      [],
      ['DATOS PERSONALES'],
      ['Nombre Completo', inscription.full_name],
      ['DNI', inscription.dni || '-'],
      ['Fecha de Nacimiento', inscription.birth_date || '-'],
      ['Edad', inscription.age ? `${inscription.age} años` : '-'],
      ['Localidad', inscription.locality || '-'],
      ['Provincia', inscription.province || '-'],
      ['Teléfono', inscription.phone || '-'],
      ['Email', inscription.email || '-'],
      ['Dirección', inscription.address || '-'],
    ];

    if (inscription.members && inscription.members.length) {
      profileData.push([], ['NÓMINA DE INTEGRANTES']);
      profileData.push(['Nombre Completo', 'DNI', 'Rol / Instrumento']);
      for (const m of inscription.members) {
        profileData.push([
          m.fullName || m.name || '-',
          (m as any).dni || '-',
          m.role || m.instrument || '-',
        ]);
      }
    }

    if (inscription.themes && inscription.themes.length) {
      profileData.push([], ['REPERTORIO']);
      profileData.push(['Título', 'Autor / Compositor', 'Estilo / Ritmo']);
      for (const t of inscription.themes) {
        profileData.push([
          t.title || t.name || '-',
          t.author || t.composer || '-',
          t.rhythm || t.style || '-',
        ]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(profileData);

    ws['!cols'] = [
      { wch: 22 },
      { wch: 35 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Ficha');
    const name = filename || `ficha-${(inscription.stage_name || inscription.full_name || inscription.id).replace(/\s+/g, '_').toLowerCase()}`;
    XLSX.writeFile(workbook, `${name}.xlsx`);
  }

  private buildSheet(inscriptions: Inscription[]): XLSX.WorkSheet {
    const rows = inscriptions.map(i => {
      const row: Record<string, any> = {};
      for (const col of this.LIST_COLUMNS) {
        switch (col.key) {
          case 'sede':
            row[col.key] = i.city || i.locality || '';
            break;
          case 'memberCount':
            row[col.key] = i.members?.length || 0;
            break;
          case 'membersDni':
            row[col.key] = i.members
              ?.map(m => `${m.fullName || m.name} (${(m as any).dni || 'S/DNI'})`)
              .join('; ') || '-';
            break;
          case 'repertoire':
            row[col.key] = i.themes
              ?.map(t => `${t.title || t.name || 'Tema'} - ${t.author || t.composer || 'Anónimo'}`)
              .join('; ') || i.songs_list || '-';
            break;
          case 'docStatus':
            row[col.key] = this.getDocumentStatus(i);
            break;
          case 'status':
            row[col.key] = this.formatStatus(i.status);
            break;
          default:
            row[col.key] = (i as any)[col.key] ?? '';
        }
      }
      return row;
    });

    const headers = this.LIST_COLUMNS.map(c => c.header);
    const data = rows.map(r => this.LIST_COLUMNS.map(c => r[c.key]));
    const wsData = [headers, ...data];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = this.LIST_COLUMNS.map(c => ({ wch: c.width || 15 }));

    return ws;
  }

  private getDocumentStatus(i: Inscription): string {
    const docs: string[] = [];
    if (i.dni_front_url) docs.push('DNI');
    if (i.lyrics_url) docs.push('Jurada');
    if (i.promo_photo_url) docs.push('Foto');
    return docs.length ? docs.join(', ') : 'Pendiente';
  }

  private formatStatus(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_REVISION: 'En Revisión',
      APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada',
      CONTRATO_FIRMADO: 'Contrato Firmado',
    };
    return map[status] || status;
  }
}
