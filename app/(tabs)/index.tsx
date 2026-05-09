import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarStore } from '@/store/calendarStore';
import { useTodoStore } from '@/store/todoStore';
import { Colors } from '@/constants/Colors';

// Logo (assets/logo.png wenn vorhanden, sonst Platzhalter)
const LOGO_SOURCE = (() => {
  try { return require('@/assets/logo.png'); } catch { return null; }
})();

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Guten Morgen';
  if (h >= 12 && h < 14) return 'Guten Mittag';
  if (h >= 14 && h < 18) return 'Guten Nachmittag';
  return 'Guten Abend';
}

// ─── Modul-Karten ─────────────────────────────────────────────────────

const MODULES = [
  { key: 'calendar',    title: 'Kalender',       icon: 'calendar'              as const, color: '#F97316', href: '/(tabs)/calendar' },
  { key: 'todos',       title: 'To-Do',          icon: 'checkbox'              as const, color: '#4ADE80', href: '/(tabs)/todos' },
  { key: 'notes',       title: 'Notizen',        icon: 'document-text'        as const, color: '#60A5FA', href: '/(tabs)/notes' },
  { key: 'spreadsheet', title: 'Tabellen',       icon: 'grid'                 as const, color: '#A78BFA', href: '/(tabs)/spreadsheet' },
  { key: 'finance',     title: 'Finanzen',       icon: 'wallet'               as const, color: '#FBBF24', href: '/(tabs)/finance' },
  { key: 'ai-chat',     title: 'KI-Chat',        icon: 'chatbubble-ellipses'  as const, color: '#F472B6', href: '/(tabs)/ai-chat' },
  { key: 'settings',    title: 'Einstellungen',  icon: 'settings'             as const, color: '#94A3B8', href: '/(tabs)/settings' },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: Colors.danger,
  medium: Colors.warning,
  low: Colors.text.disabled,
};

// ─── Dashboard ────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { loadAllEvents } = useCalendarStore();
  const allEvents = useCalendarStore((s) => s.events);
  const { loadAll: loadTodos, items: allTodos, toggleDone } = useTodoStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const formattedDate = format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de });

  const todayEvents = useMemo(
    () =>
      allEvents
        .filter((e) => e.date === today)
        .sort((a, b) => {
          if (a.isAllDay && !b.isAllDay) return -1;
          if (!a.isAllDay && b.isAllDay) return 1;
          return (a.startTime ?? '').localeCompare(b.startTime ?? '');
        }),
    [allEvents, today]
  );

  const todayTodos = useMemo(
    () =>
      allTodos
        .filter((t) => t.dueDate === today)
        .sort((a, b) => {
          if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
          const p: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
        }),
    [allTodos, today]
  );

  const openCount = todayTodos.filter((t) => !t.isDone).length;

  useEffect(() => {
    loadAllEvents();
    loadTodos();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header: Logo + Begrüßung ── */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            {LOGO_SOURCE ? (
              <Image source={LOGO_SOURCE} style={styles.logoImg} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoLetter}>M</Text>
              </View>
            )}
          </View>
          <View style={styles.greetWrap}>
            <Text style={styles.greetText}>{getGreeting()} 👋</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        {/* ── Stat-Karten ── */}
        <View style={styles.statsRow}>
          <Pressable
            style={({ pressed }) => [styles.statCard, { borderLeftColor: Colors.primary }, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/calendar' as any)}
          >
            <View style={[styles.statIconWrap, { backgroundColor: Colors.primary + '22' }]}>
              <Ionicons name="calendar" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.statNum}>{todayEvents.length}</Text>
            <Text style={styles.statLabel}>Termine{'\n'}heute</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.statCard, { borderLeftColor: Colors.secondary }, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/todos' as any)}
          >
            <View style={[styles.statIconWrap, { backgroundColor: Colors.secondary + '22' }]}>
              <Ionicons name="checkbox" size={22} color={Colors.secondary} />
            </View>
            <Text style={styles.statNum}>{openCount}</Text>
            <Text style={styles.statLabel}>Aufgaben{'\n'}offen</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.statCard, { borderLeftColor: '#60A5FA' }, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/notes' as any)}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#60A5FA22' }]}>
              <Ionicons name="document-text" size={22} color="#60A5FA" />
            </View>
            <Text style={styles.statNum}>{allTodos.filter(t => !t.isDone).length}</Text>
            <Text style={styles.statLabel}>Offene{'\n'}Aufgaben</Text>
          </Pressable>
        </View>

        {/* ── Heute-Sektion ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HEUTE</Text>
            <Pressable onPress={() => router.push('/(tabs)/calendar' as any)}>
              <Text style={styles.sectionLink}>Alle anzeigen →</Text>
            </Pressable>
          </View>

          {todayEvents.length === 0 && todayTodos.length === 0 ? (
            <View style={styles.emptyDay}>
              <Ionicons name="sunny-outline" size={36} color={Colors.text.disabled} />
              <Text style={styles.emptyDayText}>Heute steht nichts an — genieße deinen Tag!</Text>
            </View>
          ) : (
            <View style={styles.agendaList}>
              {todayEvents.map((event) => (
                <Pressable
                  key={event.id}
                  style={({ pressed }) => [styles.agendaItem, pressed && styles.pressed]}
                  onPress={() => router.push(`/calendar/${event.id}` as any)}
                >
                  <View style={[styles.agendaDot, { backgroundColor: Colors.eventCategories[event.category] }]} />
                  <View style={styles.agendaContent}>
                    <Text style={styles.agendaTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.agendaMeta}>
                      {event.isAllDay
                        ? 'Ganztägig'
                        : event.startTime
                        ? `${event.startTime}${event.endTime ? ' – ' + event.endTime : ''}`
                        : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={Colors.text.disabled} />
                </Pressable>
              ))}

              {todayTodos.map((todo) => (
                <Pressable
                  key={todo.id}
                  style={({ pressed }) => [styles.agendaItem, pressed && styles.pressed]}
                  onPress={() => router.push(`/todos/${todo.id}` as any)}
                >
                  <Pressable onPress={() => toggleDone(todo.id)} hitSlop={8}>
                    <Ionicons
                      name={todo.isDone ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={todo.isDone ? Colors.primary : Colors.text.disabled}
                    />
                  </Pressable>
                  <View style={styles.agendaContent}>
                    <Text
                      style={[styles.agendaTitle, todo.isDone && styles.doneTodo]}
                      numberOfLines={1}
                    >
                      {todo.title}
                    </Text>
                    {todo.description ? (
                      <Text style={styles.agendaMeta} numberOfLines={1}>{todo.description}</Text>
                    ) : null}
                  </View>
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[todo.priority] }]} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Module-Grid ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>MODULE</Text>
          <View style={styles.moduleGrid}>
            {MODULES.map((mod) => (
              <Pressable
                key={mod.key}
                style={({ pressed }) => [styles.moduleCard, pressed && styles.moduleCardPressed]}
                onPress={() => router.push(mod.href as any)}
              >
                <View style={[styles.moduleIconWrap, { backgroundColor: mod.color + '20' }]}>
                  <Ionicons name={mod.icon} size={30} color={mod.color} />
                </View>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: 16, paddingBottom: 32, gap: 20 },
  pressed: { opacity: 0.7 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: { width: 52, height: 52, resizeMode: 'contain' },
  logoPlaceholder: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: { fontSize: 26, fontWeight: '900', color: Colors.text.inverse },
  greetWrap: { flex: 1, gap: 2 },
  greetText: { fontSize: 22, fontWeight: '800', color: Colors.text.primary },
  dateText: { fontSize: 13, color: Colors.text.secondary },

  // Stat-Karten
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    gap: 6,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNum: { fontSize: 26, fontWeight: '800', color: Colors.text.primary },
  statLabel: { fontSize: 11, color: Colors.text.secondary, lineHeight: 16 },

  // Sektion
  section: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text.disabled,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  // Leerer Tag
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  emptyDayText: {
    fontSize: 13,
    color: Colors.text.disabled,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Agenda-Einträge
  agendaList: { gap: 2 },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  agendaDot: { width: 4, height: 34, borderRadius: 2 },
  agendaContent: { flex: 1 },
  agendaTitle: { fontSize: 14, fontWeight: '500', color: Colors.text.primary },
  agendaMeta: { fontSize: 11, color: Colors.text.secondary, marginTop: 1 },
  doneTodo: { textDecorationLine: 'line-through', color: Colors.text.disabled },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },

  // Modul-Grid
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moduleCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moduleCardPressed: {
    backgroundColor: Colors.background.card,
    transform: [{ scale: 0.96 }],
  },
  moduleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
