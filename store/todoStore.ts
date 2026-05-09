import { create } from 'zustand';
import { TodoItem, TodoProject, TodoPriority } from '@/types/todo';
import {
  loadTodos, addTodo, updateTodo, deleteTodo,
  loadProjects, addProject, deleteProject,
} from '@/storage/todoStorage';

export type FilterTab = 'all' | 'open' | 'done';

interface TodoState {
  items: TodoItem[];
  projects: TodoProject[];
  activeFilter: FilterTab;
  activeProjectId: string | null;  // null = alle Projekte
  isLoading: boolean;

  // Laden
  loadAll: () => Promise<void>;

  // Filter
  setFilter: (filter: FilterTab) => void;
  setProjectFilter: (projectId: string | null) => void;

  // Aufgaben
  createTodo: (item: TodoItem) => Promise<void>;
  editTodo: (item: TodoItem) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;

  // Projekte
  createProject: (project: TodoProject) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  items: [],
  projects: [],
  activeFilter: 'open',
  activeProjectId: null,
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    const [items, projects] = await Promise.all([loadTodos(), loadProjects()]);
    set({ items, projects, isLoading: false });
  },

  setFilter: (filter) => set({ activeFilter: filter }),
  setProjectFilter: (projectId) => set({ activeProjectId: projectId }),

  createTodo: async (item) => {
    await addTodo(item);
    set((s) => ({ items: [item, ...s.items] }));
  },

  editTodo: async (item) => {
    await updateTodo(item);
    set((s) => ({ items: s.items.map((t) => (t.id === item.id ? item : t)) }));
  },

  toggleDone: async (id) => {
    const { items } = get();
    const item = items.find((t) => t.id === id);
    if (!item) return;
    const updated = { ...item, isDone: !item.isDone, updatedAt: new Date().toISOString() };
    await updateTodo(updated);
    set((s) => ({ items: s.items.map((t) => (t.id === id ? updated : t)) }));
  },

  removeTodo: async (id) => {
    await deleteTodo(id);
    set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
  },

  createProject: async (project) => {
    await addProject(project);
    set((s) => ({ projects: [...s.projects, project] }));
  },

  removeProject: async (id) => {
    await deleteProject(id);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      // Aufgaben des Projekts auch löschen
      items: s.items.filter((t) => t.projectId !== id),
    }));
  },
}));

// Selektor: gefilterte Aufgaben
export const selectFilteredTodos = (state: TodoState): TodoItem[] => {
  let result = state.items;

  // Nach Projekt filtern
  if (state.activeProjectId) {
    result = result.filter((t) => t.projectId === state.activeProjectId);
  }

  // Nach Status filtern
  if (state.activeFilter === 'open') {
    result = result.filter((t) => !t.isDone);
  } else if (state.activeFilter === 'done') {
    result = result.filter((t) => t.isDone);
  }

  // Sortierung: zuerst nach Priorität, dann nach Datum
  const priorityOrder: Record<TodoPriority, number> = { high: 0, medium: 1, low: 2 };
  return result.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
};
