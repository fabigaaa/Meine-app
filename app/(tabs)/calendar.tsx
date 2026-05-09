import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useCalendarStore } from '@/store/calendarStore';
import { useTodoStore } from '@/store/todoStore';
import { CalendarViewMode } from '@/types/calendar';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DayPanel } from '@/components/calendar/DayPanel';
import { WeekView } from '@/components/calendar/WeekView';
import { AgendaView } from '@/components/calendar/AgendaView';
import { Colors } from '@/constants/Colors';

const VIEW_TABS: { value: CalendarViewMode; label: string }[] = [
  { value: 'month', label: 'Monat' },
  { value: 'week', label: 'Woche' },
  { value: 'agenda', label: 'Agenda' },
];

export default function CalendarScreen() {
  const { loadAllEvents, selectDate, selectedDate, currentView, setView } = useCalendarStore();
  const allEvents = useCalendarStore((s) => s.events);
  const { loadAll: loadTodos, items: allTodos, toggleDone } = useTodoStore();

  const events = useMemo(
    () =>
      allEvents
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [allEvents, selectedDate]
  );

  const todos = useMemo(
    () => allTodos.filter((t) => t.dueDate === selectedDate),
    [allTodos, selectedDate]
  );

  useEffect(() => {
    loadAllEvents();
    loadTodos();
  }, []);

  const goToToday = () => selectDate(format(new Date(), 'yyyy-MM-dd'));
  const handleEventPress = (id: string) => router.push(`/calendar/${id}`);
  const handleTodoPress = (id: string) => router.push(`/todos/${id}`);

  const handleAddPress = (date?: string) => {
    if (date) selectDate(date);
    Alert.alert('Hinzufügen', 'Was möchtest du erstellen?', [
      { text: '📅 Termin', onPress: () => router.push('/calendar/new-event') },
      { text: '✅ Aufgabe', onPress: () => router.push(`/todos/new-todo?date=${date ?? selectedDate}`) },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  };

  const handleSlotPress = (date: string, time: string) => {
    selectDate(date);
    router.push(`/calendar/new-event?time=${time}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.toolbar}>
        <View style={styles.segmented}>
          {VIEW_TABS.map((tab) => (
            <Pressable
              key={tab.value}
              style={[styles.segBtn, currentView === tab.value && styles.segBtnActive]}
              onPress={() => setView(tab.value)}
            >
              <Text style={[styles.segText, currentView === tab.value && styles.segTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.todayBtn} onPress={goToToday}>
          <Text style={styles.todayBtnText}>Heute</Text>
        </Pressable>
      </View>

      {currentView === 'month' && (
        <>
          <CalendarView selectedDate={selectedDate} onDateSelect={selectDate} />
          <View style={styles.divider} />
          <DayPanel
            selectedDate={selectedDate}
            events={events}
            todos={todos}
            onAddPress={() => handleAddPress()}
            onEventPress={handleEventPress}
            onTodoToggle={toggleDone}
            onTodoPress={handleTodoPress}
          />
        </>
      )}
      {currentView === 'week' && (
        <WeekView onEventPress={handleEventPress} onSlotPress={handleSlotPress} />
      )}
      {currentView === 'agenda' && (
        <AgendaView onEventPress={handleEventPress} onAddPress={handleAddPress} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  divider: { height: 1, backgroundColor: Colors.border },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 3,
  },
  segBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  segBtnActive: { backgroundColor: Colors.background.card },
  segText: { fontSize: 13, color: Colors.text.secondary },
  segTextActive: { fontSize: 13, color: Colors.text.primary, fontWeight: '600' },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  todayBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
});
