import { router, useLocalSearchParams } from 'expo-router';
import uuid from 'react-native-uuid';
import { TodoForm } from '@/components/todos/TodoForm';
import { useTodoStore } from '@/store/todoStore';
import { TodoItem, TodoFormValues } from '@/types/todo';

export default function NewTodoScreen() {
  const { createTodo } = useTodoStore();
  // Datum aus URL-Parameter übernehmen (z. B. wenn aus dem Kalender geöffnet)
  const { date } = useLocalSearchParams<{ date?: string }>();

  const handleSubmit = async (values: TodoFormValues) => {
    const now = new Date().toISOString();
    const item: TodoItem = {
      id: uuid.v4() as string,
      title: values.title,
      description: values.description || undefined,
      projectId: values.projectId || undefined,
      priority: values.priority,
      isDone: false,
      dueDate: values.dueDate || undefined,
      createdAt: now,
      updatedAt: now,
    };
    await createTodo(item);
    router.back();
  };

  return (
    <TodoForm
      initialValues={date ? { dueDate: date } : undefined}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Aufgabe erstellen"
    />
  );
}
