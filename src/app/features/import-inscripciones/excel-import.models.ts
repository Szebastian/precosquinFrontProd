/**
 * Domain models and configuration for Excel-based inscription import.
 *
 * Single source of truth for:
 *  - Excel ↔ DB column mapping rules
 *  - Field definitions (required/optional)
 *  - Parsed row and import result types
 */

/* ────────────────────────────────────────────
 *  Column mapping rule
 * ──────────────────────────────────────────── */

export interface ColumnMapRule {
  /** Accepted normalized column names from the Excel file (lowercase, no accents). */
  readonly excelNames: readonly string[];
  /** Target field key in the inscription payload. */
  readonly fieldKey: string;
  /** Human-readable label shown in the mapper UI. */
  readonly label: string;
}

/**
 * Frozen mapping table — 13 columns exactly as specified.
 * Normalization: lowercase + strip accents + strip non-alphanumeric.
 */
export const EXCEL_COLUMN_MAP: readonly ColumnMapRule[] = Object.freeze([
  { excelNames: ['nombre'],                         fieldKey: 'first_name',       label: 'Nombre' },
  { excelNames: ['apellido'],                       fieldKey: 'last_name',        label: 'Apellido' },
  { excelNames: ['dni'],                            fieldKey: 'dni',              label: 'DNI' },
  { excelNames: ['direccion', 'dirección'],         fieldKey: 'address',          label: 'Dirección' },
  { excelNames: ['telefono', 'teléfono'],           fieldKey: 'phone',            label: 'Teléfono' },
  { excelNames: ['correo electronico', 'correo electrónico', 'correo', 'email'],
                                                    fieldKey: 'email',            label: 'Correo Electrónico' },
  { excelNames: ['ciudad'],                         fieldKey: 'locality',         label: 'Ciudad' },
  { excelNames: ['instrumento que tocan'],          fieldKey: 'instrument_name',  label: 'Instrumento que Tocan' },
  { excelNames: ['instrumento'],                    fieldKey: 'instrument_name',  label: 'Instrumento' },
  { excelNames: ['necesita'],                       fieldKey: 'technical_needs',  label: 'Necesita' },
  { excelNames: ['nombre del tema'],                fieldKey: 'theme_title',      label: 'Nombre del Tema' },
  { excelNames: ['autor'],                          fieldKey: 'theme_author',     label: 'Autor' },
  { excelNames: ['ritmo'],                          fieldKey: 'theme_rhythm',     label: 'Ritmo' },
] as const);

/* ────────────────────────────────────────────
 *  Field definitions
 * ──────────────────────────────────────────── */

export interface FieldDef {
  readonly key: string;
  readonly label: string;
  readonly required: boolean;
}

export const REQUIRED_FIELDS: readonly FieldDef[] = Object.freeze([
  { key: 'first_name', label: 'Nombre',             required: true },
  { key: 'last_name',  label: 'Apellido',           required: true },
  { key: 'email',      label: 'Correo Electrónico', required: true },
  { key: 'phone',      label: 'Teléfono',           required: true },
]);

export const OPTIONAL_FIELDS: readonly FieldDef[] = Object.freeze([
  { key: 'dni',              label: 'DNI',              required: false },
  { key: 'address',          label: 'Dirección',        required: false },
  { key: 'locality',         label: 'Ciudad',           required: false },
  { key: 'instrument_name',  label: 'Instrumento',      required: false },
  { key: 'technical_needs',  label: 'Necesita',         required: false },
  { key: 'theme_title',      label: 'Nombre del Tema',  required: false },
  { key: 'theme_author',     label: 'Autor',            required: false },
  { key: 'theme_rhythm',     label: 'Ritmo',            required: false },
]);

export const ALL_FIELDS: readonly FieldDef[] = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

/* ────────────────────────────────────────────
 *  Runtime types
 * ──────────────────────────────────────────── */

export interface ColumnMapping {
  readonly excelCol: string;
  fieldKey: string;
}

export interface ParsedRow {
  readonly _raw: Record<string, unknown>;
  readonly _rowNum: number;
  readonly _errors: string[];
  readonly _computed: {
    readonly full_name: string;
    readonly themes: { title: string; author: string; rhythm: string }[];
  };
  [fieldKey: string]: unknown;
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; name: string; error: string }[];
}

/* ────────────────────────────────────────────
 *  Helpers
 * ──────────────────────────────────────────── */

/** Normalize a string for column matching: lowercase, strip accents, strip non-alphanumeric. */
export function normalizeColName(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/** Find a column map rule that matches the given normalized name. */
export function resolveColumnRule(normalizedName: string): ColumnMapRule | undefined {
  return EXCEL_COLUMN_MAP.find(rule => rule.excelNames.includes(normalizedName));
}

/** Build the inscription POST body from a validated ParsedRow. */
export function toInscriptionPayload(row: ParsedRow): Record<string, unknown> {
  return {
    full_name:        row._computed.full_name,
    first_name:       row['first_name']       ?? '',
    last_name:        row['last_name']        ?? '',
    email:            row['email']            ?? '',
    phone:            row['phone']            ?? '',
    dni:              row['dni']              ?? '',
    address:          row['address']          ?? '',
    locality:         row['locality']         ?? '',
    instrument_name:  row['instrument_name']  ?? '',
    technical_needs:  row['technical_needs']  ?? '',
    category:         'Musica',
    subcategory:      'solista_instrumental',
    status:           'PENDIENTE',
    ...(row._computed.themes.length ? { themes: row._computed.themes } : {}),
  };
}

/* ────────────────────────────────────────────
 *  Backend parse result types
 *  (mirror Python Pydantic models)
 * ──────────────────────────────────────────── */

export interface BackendSolistaData {
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  correo_electronico: string;
  ciudad: string;
  provincia: string;
  instrumento_que_tocan: string;
  tipo_instrumento: string;
}

export interface BackendInstrumentoItem {
  instrumento: string;
  necesita: string;
}

export interface BackendTemaItem {
  nombre_del_tema: string;
  autor: string;
  ritmo: string;
}

export interface BackendMissingField {
  field_key: string;
  label: string;
  section: string;
}

export interface BackendParseResult {
  solista: BackendSolistaData;
  instrumentos: BackendInstrumentoItem[];
  temas: BackendTemaItem[];
  missing_fields: BackendMissingField[];
  warnings: string[];
}
