import { create } from 'zustand';
import { format } from 'date-fns';
import { CalendarEvent, CalendarViewMode, MarkedDates } from '@/types/calendar';
import { loadEvents, addEvent, updateEvent, deleteEvent } from '@/storage/calendarStorage';

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string;
  currentView: CalendarViewMode;
  isLoading: boolean;
  loadAllEvents: () => Promise<void>;
  selectDate: (date: string) => void;
  setView: (view: CalendarViewMode) => void;
  createEvent: (event: CalendarEvent) => Promise<void>;
  editEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  currentView: 'month',
  isLoading: false,

  loadAllEvents: async () => {
    set({ isLoading: true });
    const events = await loadEvents();
    set({ events, isLoading: false });
  },

  selectDate: (date) => set({ selectedDate: date }),
  setView: (view) => set({ currentView: view }),

  createEvent: async (event) => {
    await addEvent(event);
    const events = await loadEvents();
    set({ events });
  },

  editEvent: async (event) => {
    await updateEvent(event);
    const events = await loadEvents();
    set({ events });
  },

  removeEvent: async (id) => {
    await deleteEvent(id);
    const { events } = get();
    set({ events: events.filter((e) => e.id !== id) });
  },
}));

export const selectEventsForDate = (date: string) => (state: CalendarState) =>
  state.events
    .filter((e) => e.date === date)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

export const selectMarkedDates = (selectedDate: string) => (state: CalendarState): MarkedDates => {
  const marks: MarkedDates = {};
  state.events.forEach((e) => {
    marks[e.date] = { marked: true, dotColor: '#4F46E5' };
  });
  marks[selectedDate] = {
    ...marks[selectedDate],
    selected: true,
    selectedColor: '#4F46E5',
  };
  return marks;
};
