import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/types/note';

const STORAGE_KEY = 'notes';

export async function loadNotes(): Promise<Note[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as Note[]) : [];
  } catch {
    return [];
  }
}

async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export async function addNote(note: Note): Promise<void> {
  const notes = await loadNotes();
  notes.unshift(note); // neueste Notiz oben
  await saveNotes(notes);
}

export async function updateNote(updated: Note): Promise<void> {
  const notes = await loadNotes();
  const i = notes.findIndex((n) => n.id === updated.id);
  if (i === -1) throw new Error(`Note ${updated.id} not found`);
  notes[i] = updated;
  await saveNotes(notes);
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await loadNotes();
  await saveNotes(notes.filter((n) => n.id !== id));
}
