import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoItem, TodoProject } from '@/types/todo';

const ITEMS_KEY = 'todo_items';
const PROJECTS_KEY = 'todo_projects';

// ── Aufgaben ──────────────────────────────────────────────

export async function loadTodos(): Promise<TodoItem[]> {
  try {
    const json = await AsyncStorage.getItem(ITEMS_KEY);
    return json ? (JSON.parse(json) as TodoItem[]) : [];
  } catch {
    return [];
  }
}

async function saveTodos(items: TodoItem[]): Promise<void> {
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export async function addTodo(item: TodoItem): Promise<void> {
  const items = await loadTodos();
  items.unshift(item); // neueste Aufgabe oben
  await saveTodos(items);
}

export async function updateTodo(updated: TodoItem): Promise<void> {
  const items = await loadTodos();
  const i = items.findIndex((t) => t.id === updated.id);
  if (i === -1) throw new Error(`Todo ${updated.id} not found`);
  items[i] = updated;
  await saveTodos(items);
}

export async function deleteTodo(id: string): Promise<void> {
  const items = await loadTodos();
  await saveTodos(items.filter((t) => t.id !== id));
}

// ── Projekte ─────────────────────────────────────────────

export async function loadProjects(): Promise<TodoProject[]> {
  try {
    const json = await AsyncStorage.getItem(PROJECTS_KEY);
    return json ? (JSON.parse(json) as TodoProject[]) : [];
  } catch {
    return [];
  }
}

async function saveProjects(projects: TodoProject[]): Promise<void> {
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function addProject(project: TodoProject): Promise<void> {
  const projects = await loadProjects();
  projects.push(project);
  await saveProjects(projects);
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await loadProjects();
  await saveProjects(projects.filter((p) => p.id !== id));
}
