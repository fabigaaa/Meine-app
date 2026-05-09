export type EventCategory = 'meeting' | 'deadline' | 'personal' | 'other';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type CalendarViewMode = 'month' | 'week' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;             // "YYYY-MM-DD" start date
  endDate?: string;         // "YYYY-MM-DD" for multi-day events
  startTime?: string;       // "HH:MM"
  endTime?: string;         // "HH:MM"
  category: EventCategory;
  description?: string;
  isAllDay: boolean;
  recurrence?: RecurrenceType;
  recurrenceEndDate?: string; // "YYYY-MM-DD" when recurrence stops
  createdAt: string;
  updatedAt: string;
}

export type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    dots?: Array<{ color: string; selectedColor?: string }>;
    selected?: boolean;
    selectedColor?: string;
  };
};

export interface EventFormValues {
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  description: string;
  isAllDay: boolean;
  recurrence: RecurrenceType;
  recurrenceEndDate: string;
}
