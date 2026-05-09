import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '@/types/calendar';

const STORAGE_KEY = 'calendar_events';

export async function loadEvents(): Promise<CalendarEvent[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json === null) return [];
    return JSON.parse(json) as CalendarEvent[];
  } catch (error) {
    console.error('[calendarStorage] loadEvents failed:', error);
    return [];
  }
}

async function saveEvents(events: CalendarEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('[calendarStorage] saveEvents failed:', error);
    throw error;
  }
}

export async function addEvent(event: CalendarEvent): Promise<void> {
  const events = await loadEvents();
  events.push(event);
  await saveEvents(events);
}

export async function updateEvent(updated: CalendarEvent): Promise<void> {
  const events = await loadEvents();
  const index = events.findIndex((e) => e.id === updated.id);
  if (index === -1) throw new Error(`Event ${updated.id} not found`);
  events[index] = updated;
  await saveEvents(events);
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await loadEvents();
  const filtered = events.filter((e) => e.id !== id);
  await saveEvents(filtered);
}
