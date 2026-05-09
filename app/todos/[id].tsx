import { useLocalSearchParams, router } from 'expo-router';
import { TodoForm } from '@/components/todos/TodoForm';
import { useTodoStore } from '@/store/todoStore';
import { TodoFormValues } from '@/types/todo';

export default function EditTodoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, editTodo, removeTodo } = useTodoStore();

  const item = items.find((t) => t.id === id);

  if (!item) {
    router.back();
    return null;
  }

  const handleSubmit = async (values: TodoFormValues) => {
    await editTodo({
      ...item,
      title: values.title,
      description: values.description || undefined,
      projectId: values.projectId || undefined,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      updatedAt: new Date().toISOString(),
    });
    router.back();
  };

  const handleDelete = async () => {
    await removeTodo(item.id);
    router.back();
  };

  return (
    <TodoForm
      initialValues={{
        title: item.title,
        description: item.description ?? '',
        projectId: item.projectId ?? '',
        priority: item.priority,
        dueDate: item.dueDate ?? '',
      }}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Änderungen speichern"
      showDeleteButton
      onDelete={handleDelete}
    />
  );
}
