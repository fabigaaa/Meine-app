import { View, Text, Pressable, FlatList, StyleSheet, Alert } from 'react-native';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent } from '@/types/calendar';
import { TodoItem } from '@/types/todo';
import { Colors } from '@/constants/Colors';

interface DayPanelProps {
  selectedDate: string;
  events: CalendarEvent[];
  todos: TodoItem[];
  onAddPress: () => void;          // öffnet Auswahl-Dialog
  onEventPress: (id: string) => void;
  onTodoToggle: (id: string) => void;
  onTodoPress: (id: string) => void;
}

// ─── Termin-Zeile ─────────────────────────────────────────────────────

function EventRow({ event, onPress }: { event: CalendarEvent; onPress: () => void }) {
  const catColor = Colors.eventCategories[event.category];
  const timeLabel = event.isAllDay
    ? 'Ganztägig'
    : event.startTime
    ? `${event.startTime}${event.endTime ? ' – ' + event.endTime : ''}`
    : '';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.catDot, { backgroundColor: catColor }]} />
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
        {timeLabel ? <Text style={styles.rowMeta}>{timeLabel}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.text.disabled} />
    </Pressable>
  );
}

// ─── Aufgaben-Zeile ───────────────────────────────────────────────────

function TodoRow({
  todo,
  onToggle,
  onPress,
}: {
  todo: TodoItem;
  onToggle: () => void;
  onPress: () => void;
}) {
  const PRIORITY_COLOR: Record<string, string> = {
    high: Colors.danger,
    medium: Colors.warning,
    low: Colors.text.disabled,
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onLongPress={onPress}
    >
      {/* Checkbox */}
      <Pressable onPress={onToggle} style={styles.checkbox} hitSlop={8}>
        {todo.isDone ? (
          <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
        ) : (
          <Ionicons name="ellipse-outline" size={22} color={Colors.text.disabled} />
        )}
      </Pressable>

      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, todo.isDone && styles.doneTitle]} numberOfLines={1}>
          {todo.title}
        </Text>
        {todo.description ? (
          <Text style={styles.rowMeta} numberOfLines={1}>{todo.description}</Text>
        ) : null}
      </View>

      {/* Priorität */}
      <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[todo.priority] }]} />
    </Pressable>
  );
}

// ─── DayPanel ─────────────────────────────────────────────────────────

type ListItem =
  | { kind: 'event'; data: CalendarEvent }
  | { kind: 'todo'; data: TodoItem }
  | { kind: 'header'; label: string }
  | { kind: 'empty'; section: 'events' | 'todos' };

export function DayPanel({
  selectedDate,
  events,
  todos,
  onAddPress,
  onEventPress,
  onTodoToggle,
  onTodoPress,
}: DayPanelProps) {
  const formattedDate = format(parseISO(selectedDate), 'EEEE, d. MMMM', { locale: de });

  // Sortierte Termine (ganztägig zuerst, dann nach Uhrzeit)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return (a.startTime ?? '').localeCompare(b.startTime ?? '');
  });

  // Aufgaben: zuerst offene (nach Priorität), dann erledigte
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    const prio = { high: 0, medium: 1, low: 2 };
    return (prio[a.priority] ?? 1) - (prio[b.priority] ?? 1);
  });

  // Kombinierte Liste aufbauen
  const items: ListItem[] = [
    { kind: 'header' as const, label: 'Termine' },
    ...(sortedEvents.length > 0
      ? sortedEvents.map((e): ListItem => ({ kind: 'event', data: e }))
      : [{ kind: 'empty' as const, section: 'events' as const }]),
    { kind: 'header' as const, label: 'Aufgaben' },
    ...(sortedTodos.length > 0
      ? sortedTodos.map((t): ListItem => ({ kind: 'todo', data: t }))
      : [{ kind: 'empty' as const, section: 'todos' as const }]),
  ];

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.kind === 'header') {
      return <Text style={styles.sectionHeader}>{item.label}</Text>;
    }
    if (item.kind === 'event') {
      return (
        <EventRow
          event={item.data}
          onPress={() => onEventPress(item.data.id)}
        />
      );
    }
    if (item.kind === 'todo') {
      return (
        <TodoRow
          todo={item.data}
          onToggle={() => onTodoToggle(item.data.id)}
          onPress={() => onTodoPress(item.data.id)}
        />
      );
    }
    // Empty state
    return (
      <Text style={styles.emptyText}>
        {item.section === 'events' ? 'Keine Termine' : 'Keine Aufgaben'}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header: Datum + Hinzufügen-Button */}
      <View style={styles.header}>
        <Text style={styles.dateTitle}>{formattedDate}</Text>
        <Pressable style={styles.addBtn} onPress={onAddPress} accessibilityLabel="Hinzufügen">
          <Ionicons name="add" size={22} color={Colors.text.inverse} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, i) => {
          if (item.kind === 'event') return `ev-${item.data.id}`;
          if (item.kind === 'todo') return `td-${item.data.id}`;
          if (item.kind === 'header') return `hdr-${item.label}`;
          return `empty-${i}`;
        }}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: { paddingBottom: 20 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.disabled,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    textTransform: 'uppercase',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pressed: { opacity: 0.6, backgroundColor: Colors.background.secondary },
  catDot: { width: 4, height: 36, borderRadius: 2 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '500', color: Colors.text.primary },
  rowMeta: { fontSize: 12, color: Colors.text.secondary, marginTop: 1 },
  doneTitle: { textDecorationLine: 'line-through', color: Colors.text.disabled },

  checkbox: { width: 28, justifyContent: 'center', alignItems: 'center' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },

  emptyText: {
    fontSize: 13,
    color: Colors.text.disabled,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontStyle: 'italic',
  },
});
