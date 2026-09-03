/**
 * Business logic for Excel-based inscription import.
 *
 * Two modes:
 *  1. **Backend parsing** — send .xlsx to Python endpoint, get structured JSON.
 *  2. **Client-side parsing** — fallback: SheetJS + column mapping + import.
 *
 * Zero UI, zero side effects beyond HTTP.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

import { environment } from '../../../environments/environment';
import {
  ColumnMapping,
  ParsedRow,
  ImportResult,
  BackendParseResult,
  BackendInstrumentoItem,
  normalizeColName,
  resolveColumnRule,
  toInscriptionPayload,
} from './excel-import.models';

@Injectable({ providedIn: 'root' })
export class ExcelImportService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inscriptions`;

  /* ═══════════════════════════════════════════
   *  Mode 1: Backend parsing (preferred)
   * ═══════════════════════════════════════════ */

  /** Upload file with progress tracking. Returns Observable of HttpEvent. */
  parseExcelWithBackend$(file: File): Observable<HttpEvent<BackendParseResult>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const req = new HttpRequest('POST', `${this.apiUrl}/parse-excel`, formData, {
      reportProgress: true,
    });
    return this.http.request<BackendParseResult>(req);
  }

  /** Backend parse result shape — mirrors Python Pydantic model. */
  parseExcelWithBackend(file: File): Promise<BackendParseResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return firstValueFrom(
      this.http.post<BackendParseResult>(`${this.apiUrl}/parse-excel`, formData),
    );
  }

  /* ═══════════════════════════════════════════
   *  Mode 2: Client-side parsing (fallback)
   * ═══════════════════════════════════════════ */

  /** Read an Excel file into a SheetJS workbook. Throws on invalid file. */
  parseWorkbook(file: File): XLSX.WorkBook {
    if (!this.isExcelFile(file.name)) {
      throw new Error(`Formato no soportado: ${file.name}. Use archivos .xlsx o .xls.`);
    }
    return XLSX.read(file, { type: 'array' });
  }

  /** Extract the first sheet as an array of row objects (keyed by header). */
  sheetToObjects(wb: XLSX.WorkBook): Record<string, unknown>[] {
    const firstSheet = wb.SheetNames[0];
    if (!firstSheet) throw new Error('El archivo no contiene hojas de datos.');
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[firstSheet], { defval: '' });
    if (!rows.length) throw new Error('El archivo está vacío o no tiene datos válidos.');
    return rows;
  }

  /** Get the column headers from the first row of objects. */
  extractColumns(rows: Record<string, unknown>[]): string[] {
    return rows.length ? Object.keys(rows[0]) : [];
  }

  /* ──────────────── Column Mapping ──────────────── */

  /** Auto-detect mappings by exact normalized column name match. */
  autoDetect(columns: string[]): ColumnMapping[] {
    return columns.map(excelCol => {
      const normalized = normalizeColName(excelCol);
      const rule = resolveColumnRule(normalized);
      return { excelCol, fieldKey: rule?.fieldKey ?? '' };
    });
  }

  /** Filter to only user-assigned mappings (fieldKey non-empty). */
  filterAssigned(mappings: ColumnMapping[]): ColumnMapping[] {
    return mappings.filter(m => m.fieldKey.trim() !== '');
  }

  /* ──────────────── Normalization ──────────────── */

  /** Convert raw row objects to ParsedRow objects. */
  normalizeRows(rawRows: Record<string, unknown>[], mappings: ColumnMapping[]): ParsedRow[] {
    const assigned = this.filterAssigned(mappings);
    return rawRows
      .map((row, idx) => this.normalizeSingleRow(row, idx + 2, assigned))
      .filter((r): r is ParsedRow => r !== null);
  }

  private normalizeSingleRow(
    row: Record<string, unknown>,
    rowNumber: number,
    mappings: ColumnMapping[],
  ): ParsedRow | null {
    const raw: Record<string, unknown> = {};
    const fields: Record<string, unknown> = {};

    for (const m of mappings) {
      const value = String(row[m.excelCol] ?? '').trim();
      raw[m.excelCol] = value;
      fields[m.fieldKey] = value;
    }

    // first_name + last_name → full_name
    const firstName = String(fields['first_name'] ?? '').trim();
    const lastName  = String(fields['last_name']  ?? '').trim();
    const fullName  = [firstName, lastName].filter(Boolean).join(' ');

    // Theme fields → themes[]
    const themeTitle  = String(fields['theme_title']  ?? '').trim();
    const themeAuthor = String(fields['theme_author'] ?? '').trim();
    const themeRhythm = String(fields['theme_rhythm'] ?? '').trim();
    const themes = themeTitle
      ? [{ title: themeTitle, author: themeAuthor, rhythm: themeRhythm }]
      : [];

    return {
      _raw: raw,
      _rowNum: rowNumber,
      _errors: [],
      _computed: { full_name: fullName, themes },
      ...fields,
    } as ParsedRow;
  }

  /* ──────────────── Validation ──────────────── */

  /** Mutates rows: populates `_errors` for each invalid row. Returns the same array. */
  validateRows(rows: ParsedRow[]): ParsedRow[] {
    for (const row of rows) {
      if (!row['first_name'] || String(row['first_name']).trim() === '') {
        row._errors.push('Falta Nombre');
      }
      if (!row['last_name'] || String(row['last_name']).trim() === '') {
        row._errors.push('Falta Apellido');
      }
      if (!row['email'] || !this.isValidEmail(String(row['email']))) {
        row._errors.push('Correo electrónico inválido o ausente');
      }
      if (!row['phone'] || String(row['phone']).trim() === '') {
        row._errors.push('Falta Teléfono');
      }
    }
    return rows;
  }

  /** Count rows with no errors. */
  countValid(rows: ParsedRow[]): number {
    return rows.filter(r => r._errors.length === 0).length;
  }

  /* ──────────────── Import ──────────────── */

  /** POST each valid row to the API. Returns aggregate result. */
  async importValidRows(rows: ParsedRow[]): Promise<ImportResult> {
    const valid = rows.filter(r => r._errors.length === 0);
    let success = 0;
    let failed  = 0;
    const errors: ImportResult['errors'] = [];

    for (const row of valid) {
      try {
        const payload = toInscriptionPayload(row);
        await firstValueFrom(this.http.post(this.apiUrl, payload));
        success++;
      } catch (err: unknown) {
        failed++;
        const msg = this.extractHttpError(err);
        errors.push({ row: row._rowNum, name: row._computed.full_name, error: msg });
      }
    }

    return { total: valid.length, success, failed, errors };
  }

  /* ──────────────── Backend import ──────────────── */

  /**
   * Import a single inscription from the backend-parse result.
   * Converts structured data into the standard inscription payload.
   */
  importSingleFromBackend(result: BackendParseResult): Promise<ImportResult> {
    const payload = this.toBackendPayload(result);
    return firstValueFrom(
      this.http.post<ImportResult>(`${this.apiUrl}/import-from-parse`, payload),
    );
  }

  /**
   * Import a single inscription from user-edited form data.
   * The payload is already built by the component.
   */
  importEditedPayload(payload: Record<string, unknown>): Promise<ImportResult> {
    return firstValueFrom(
      this.http.post<ImportResult>(this.apiUrl, payload),
    );
  }

  /* ──────────────── Helpers ──────────────── */

  private toBackendPayload(result: BackendParseResult): Record<string, unknown> {
    const s = result.solista;
    const fullName = [s.nombre, s.apellido].filter(Boolean).join(' ').trim();
    return {
      full_name: fullName,
      first_name: s.nombre ?? '',
      last_name: s.apellido ?? '',
      email: s.correo_electronico ?? '',
      phone: s.telefono ?? '',
      dni: s.dni ?? '',
      address: s.direccion ?? '',
      locality: s.ciudad ?? '',
      province: s.provincia ?? '',
      instrument_name: s.instrumento_que_tocan ?? '',
      technical_needs: result.instrumentos
        .map((i: BackendInstrumentoItem) => `${i.instrumento}: ${i.necesita}`)
        .filter(Boolean)
        .join(', '),
      category: 'Musica',
      subcategory: 'solista_instrumental',
      status: 'PENDIENTE',
      ...(result.temas.length ? { themes: result.temas } : {}),
    };
  }

  private isExcelFile(name: string): boolean {
    return /\.(xlsx|xls)$/i.test(name);
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private extractHttpError(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const httpErr = err as { error?: { detail?: string }; message?: string };
      return httpErr.error?.detail ?? httpErr.message ?? 'Error desconocido';
    }
    return String(err);
  }
}
