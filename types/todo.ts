export type TodoPriority = 'high' | 'medium' | 'low';

export interface TodoProject {
  id: string;
  name: string;
  color: string;  // Hex-Farbe aus PROJECT_COLORS
  createdAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  priority: TodoPriority;
  isDone: boolean;
  dueDate?: string;   // "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
}

export interface TodoFormValues {
  title: string;
  description: string;
  projectId: string;
  priority: TodoPriority;
  dueDate: string;   // "" wenn kein Datum gesetzt
}

export const PROJECT_COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Grün
  '#EF4444', // Rot
  '#F59E0B', // Amber
  '#8B5CF6', // Lila
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
] as const;
