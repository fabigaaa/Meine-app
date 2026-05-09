import { router } from 'expo-router';
import { format } from 'date-fns';
import uuid from 'react-native-uuid';
import { EventForm } from '@/components/calendar/EventForm';
import { useCalendarStore } from '@/store/calendarStore';
import { CalendarEvent, EventFormValues } from '@/types/calendar';

export default function NewEventScreen() {
  const { createEvent, selectedDate } = useCalendarStore();

  const handleSubmit = async (values: EventFormValues) => {
    const now = new Date().toISOString();
    const event: CalendarEvent = {
      id: uuid.v4() as string,
      ...values,
      endDate: values.endDate || undefined,
      recurrenceEndDate: values.recurrenceEndDate || undefined,
      createdAt: now,
      updatedAt: now,
    };
    await createEvent(event);
    router.back();
  };

  return (
    <EventForm
      initialValues={{ date: selectedDate }}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Termin erstellen"
    />
  );
}
