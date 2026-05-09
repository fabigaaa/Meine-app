import { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { format, addDays, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarStore } from '@/store/calendarStore';
import { CalendarEvent } from '@/types/calendar';
import { Colors } from '@/constants/Colors';
import { expandEvents, toDateString } from '@/utils/calendarUtils';

interface AgendaViewProps {
  onEventPress: (id: string) => void;
  onAddPress: (date: string) => void;
}

interface Section {
  title: string;
  dateStr: string;
  data: CalendarEvent[];
}

function formatSectionTitle(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Heute · ${format(date, 'd. MMMM', { locale: de })}`;
  if (isTomorrow(date)) return `Morgen · ${format(date, 'd. MMMM', { locale: de })}`;
  if (isYesterday(date)) return `Gestern · ${format(date, 'd. MMMM', { locale: de })}`;
  return format(date, 'EEEE, d. MMMM yyyy', { locale: de });
}

function AgendaEventItem({
  event,
  onPress,
}: {
  event: CalendarEvent;
  onPress: () => void;
}) {
  const catColor = Colors.eventCategories[event.category];
  const timeLabel = event.isAllDay
    ? 'Ganztägig'
    : event.startTime
    ? `${event.startTime}${event.endTime ? ' – ' + event.endTime : ''}`
    : '';

  return (
    <Pressable
      style={({ pressed }) => [styles.eventItem, pressed && styles.eventItemPressed]}
      onPress={onPress}
    >
      <View style={[styles.catBar, { backgroundColor: catColor }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <View style={styles.eventMeta}>
          {timeLabel ? <Text style={styles.eventTime}>{timeLabel}</Text> : null}
          {event.recurrence && event.recurrence !== 'none' && (
            <Ionicons name="repeat" size={12} color={Colors.text.disabled} style={{ marginLeft: 4 }} />
          )}
          {event.endDate && event.endDate !== event.date && (
            <Text style={styles.multiDayBadge}>mehrtägig</Text>
          )}
        </View>
        {event.description ? (
          <Text style={styles.eventDesc} numberOfLines={1}>{event.description}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
    </Pressable>
  );
}

export function AgendaView({ onEventPress, onAddPress }: AgendaViewProps) {
  const [search, setSearch] = useState('');
  const allEvents = useCalendarStore((s) => s.events);
  const selectedDate = useCalendarStore((s) => s.selectDate);

  const today = toDateString(new Date());
  const rangeStart = toDateString(addDays(parseISO(today), -7));
  const rangeEnd = toDateString(addDays(parseISO(today), 120));

  const expanded = useMemo(
    () => expandEvents(allEvents, rangeStart, rangeEnd),
    [allEvents, rangeStart, rangeEnd]
  );

  const sections = useMemo((): Section[] => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? expanded.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            (e.description ?? '').toLowerCase().includes(q)
        )
      : expanded;

    const byDate: Record<string, CalendarEvent[]> = {};
    filtered.forEach((e) => {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    });

    return Object.keys(byDate)
      .sort()
      .map((dateStr) => ({
        title: formatSectionTitle(dateStr),
        dateStr,
        data: byDate[dateStr].sort((a, b) =>
          (a.startTime ?? '').localeCompare(b.startTime ?? '')
        ),
      }));
  }, [expanded, search]);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Termine durchsuchen…"
            placeholderTextColor={Colors.text.disabled}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.id}_${item.date}`}
        renderItem={({ item }) => (
          <AgendaEventItem
            event={item}
            onPress={() => onEventPress(item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Pressable
              onPress={() => onAddPress(section.dateStr)}
              hitSlop={8}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{search ? '🔍' : '📅'}</Text>
            <Text style={styles.emptyText}>
              {search ? 'Keine Ergebnisse' : 'Keine Termine'}
            </Text>
            {!search && (
              <Text style={styles.emptyHint}>Tippe auf + um einen Termin hinzuzufügen</Text>
            )}
          </View>
        }
        stickySectionHeadersEnabled
        contentContainerStyle={sections.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },

  searchRow: {
    padding: 12,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text.primary },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary },

  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  eventItemPressed: { opacity: 0.7 },
  catBar: { width: 4, alignSelf: 'stretch' },
  eventContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  eventTitle: { fontSize: 15, fontWeight: '500', color: Colors.text.primary },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventTime: { fontSize: 13, color: Colors.text.secondary },
  multiDayBadge: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  eventDesc: { fontSize: 12, color: Colors.text.disabled },

  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 17, fontWeight: '600', color: Colors.text.primary },
  emptyHint: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', paddingHorizontal: 32 },
});
