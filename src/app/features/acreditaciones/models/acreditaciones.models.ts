export type AccreditationStatus =
  | 'pending'
  | 'in_review'
  | 'incomplete'
  | 'ready'
  | 'accredited'
  | 'blocked';

export type AccreditationTimelineStep =
  | 'registered'
  | 'approved'
  | 'contract_signed'
  | 'payment_confirmed'
  | 'accreditation'
  | 'presentation'
  | 'evaluation'
  | 'finished';

export type CheckInMethod = 'qr' | 'dni';

export type CheckInResultType = 'found' | 'not_found' | 'already_accredited' | 'not_approved';

export interface AccreditationParticipant {
  id: string;
  inscriptionId: string;
  registrationNumber: string;
  representativeName: string;
  groupName: string;
  category: string;
  subcategory: string;
  province: string;
  locality: string;
  dni: string;
  phone: string;
  email: string;
  presentationTime: string;
  presentationDay: string;
  presentationOrder: number;
  stage: string;
  memberCount: number;
  status: AccreditationStatus;
  photoUrl: string | null;
  accreditedAt: string | null;
  accreditedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInResult {
  type: CheckInResultType;
  participant: AccreditationParticipant | null;
  message: string;
}

export interface AuditLogEntry {
  id: string;
  participantId: string;
  participantName: string;
  groupName: string;
  dni: string;
  operator: string;
  method: CheckInMethod;
  timestamp: string;
  deviceId?: string;
  ipAddress?: string;
}

export interface AccreditationStats {
  pendingCount: number;
  accreditedTodayCount: number;
  absentCount: number;
  lateCount: number;
  totalParticipants: number;
}

export interface AccreditationFilters {
  search: string;
  status: AccreditationStatus | 'all' | 'today' | 'tomorrow';
  category: string;
  stage: string;
  schedule: string;
  province: string;
}

export interface AccreditationListResponse {
  data: AccreditationParticipant[];
  total: number;
  page: number;
  page_size: number;
}

export const ACCREDITATION_STATUS_CONFIG: Record<AccreditationStatus, { label: string; color: string; bgColor: string; darkBg: string; darkColor: string }> = {
  pending: { label: 'Pendiente', color: '#64748b', bgColor: '#f1f5f9', darkBg: 'rgba(100,116,139,0.15)', darkColor: '#94a3b8' },
  in_review: { label: 'En revisión', color: '#eab308', bgColor: '#fef9c3', darkBg: 'rgba(234,179,8,0.15)', darkColor: '#fbbf24' },
  incomplete: { label: 'Doc. incompleta', color: '#ea580c', bgColor: '#fff7ed', darkBg: 'rgba(234,88,12,0.15)', darkColor: '#fb923c' },
  ready: { label: 'Listo', color: '#2563eb', bgColor: '#eff6ff', darkBg: 'rgba(37,99,235,0.15)', darkColor: '#60a5fa' },
  accredited: { label: 'Acreditado', color: '#16a34a', bgColor: '#f0fdf4', darkBg: 'rgba(22,163,74,0.15)', darkColor: '#4ade80' },
  blocked: { label: 'Bloqueado', color: '#dc2626', bgColor: '#fef2f2', darkBg: 'rgba(220,38,38,0.15)', darkColor: '#f87171' },
};

export const CHECK_IN_RESULT_CONFIG: Record<CheckInResultType, { icon: string; title: string; color: string; bgColor: string }> = {
  found: { icon: '✓', title: 'Participante encontrado', color: '#16a34a', bgColor: '#f0fdf4' },
  not_found: { icon: '✕', title: 'Participante no encontrado', color: '#dc2626', bgColor: '#fef2f2' },
  already_accredited: { icon: '⚠', title: 'Ya acreditado', color: '#eab308', bgColor: '#fef9c3' },
  not_approved: { icon: '✕', title: 'No autorizado', color: '#dc2626', bgColor: '#fef2f2' },
};
