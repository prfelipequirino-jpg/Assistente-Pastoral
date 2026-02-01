
export enum EventCategory {
  PASTORAL = 'Agenda Pastoral',
  FAMILIAR = 'Evento Familiar',
  OUTRO = 'Outro'
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // ISO String
  endDate: string;   // ISO String
  location?: string;
  description?: string;
  category: EventCategory;
  rawMessage: string;
  status: 'pending' | 'synced' | 'ignored';
}

export interface MessageAnalysis {
  isEvent: boolean;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  reasoning: string;
}
