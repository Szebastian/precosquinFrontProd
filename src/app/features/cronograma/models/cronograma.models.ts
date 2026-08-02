export interface PresentationItem {
  id: string;
  order: number;
  time: string;
  category: string;
  subcategory: string;
  participantName: string;
  groupName?: string;
  stage?: string;
  day?: string;
  observations?: string;
  status: 'published' | 'draft' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface AgendaEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
  eventType: 'presentation' | 'break' | 'soundcheck' | 'rehearsal' | 'opening' | 'closing' | 'other';
  day?: string;
  status: 'published' | 'draft' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface CronogramaFilters {
  search: string;
  category: string;
  subcategory: string;
  stage: string;
  day: string;
}

export interface PresentationListResponse {
  data: PresentationItem[];
  total: number;
}

export interface AgendaListResponse {
  data: AgendaEvent[];
  total: number;
}
