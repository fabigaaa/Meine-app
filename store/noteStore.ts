import { create } from 'zustand';
import { Note, deriveTitleFromContent } from '@/types/note';
import { loadNotes, addNote, updateNote, deleteNote } from '@/storage/noteStorage';

interface NoteState {
  notes: Note[];
  searchQuery: string;
  isLoading: boolean;

  loadAll: () => Promise<void>;
  setSearch: (query: string) => void;
  createNote: (note: Note) => Promise<void>;
  saveNote: (updated: Note) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  searchQuery: '',
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    const notes = await loadNotes();
    set({ notes, isLoading: false });
  },

  setSearch: (query) => set({ searchQuery: query }),

  createNote: async (note) => {
    await addNote(note);
    set((s) => ({ notes: [note, ...s.notes] }));
  },

  saveNote: async (updated) => {
    // Titel aus Inhalt ableiten
    const withTitle = {
      ...updated,
      title: deriveTitleFromContent(updated.content),
      updatedAt: new Date().toISOString(),
    };
    await updateNote(withTitle);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === withTitle.id ? withTitle : n)),
    }));
  },

  removeNote: async (id) => {
    await deleteNote(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },
}));

// Selektor: Suche
export const selectFilteredNotes = (state: NoteState): Note[] => {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return state.notes;
  return state.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
  );
};
