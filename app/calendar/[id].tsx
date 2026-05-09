import { useLocalSearchParams, router } from 'expo-router';
import { EventForm } from '@/components/calendar/EventForm';
import { useCalendarStore } from '@/store/calendarStore';
import { EventFormValues } from '@/types/calendar';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, editEvent, removeEvent } = useCalendarStore();

  const event = events.find((e) => e.id === id);

  if (!event) {
    router.back();
    return null;
  }

  const handleSubmit = async (values: EventFormValues) => {
    await editEvent({
      ...event,
      ...values,
      endDate: values.endDate || undefined,
      recurrenceEndDate: values.recurrenceEndDate || undefined,
      updatedAt: new Date().toISOString(),
    });
    router.back();
  };

  const handleDelete = async () => {
    await removeEvent(event.id);
    router.back();
  };

  return (
    <EventForm
      initialValues={event}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Änderungen speichern"
      showDeleteButton
      onDelete={handleDelete}
    />
  );
}
