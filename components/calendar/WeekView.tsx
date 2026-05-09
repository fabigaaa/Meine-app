import { useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { format, addDays, isToday, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarStore } from '@/store/calendarStore';
import { CalendarEvent } from '@/types/calendar';
import { Colors } from '@/constants/Colors';
import {
  expandEvents,
  getWeekStart,
  toDateString,
  timeToMinutes,
} from '@/utils/calendarUtils';

interface WeekViewProps {
  onEventPress: (id: string) => void;
  onSlotPress: (date: string, time: string) => void;
}

const HOUR_HEIGHT = 64;
const TIME_COL_WIDTH = 52;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getEventStyle(event: CalendarEvent, colWidth: number) {
  const startMin = timeToMinutes(event.startTime ?? '00:00');
  const endMin = timeToMinutes(event.endTime ?? '01:00');
  const duration = Math.max(endMin - startMin, 30);
  return {
    top: (startMin / 60) * HOUR_HEIGHT,
    height: (duration / 60) * HOUR_HEIGHT,
    left: 2,
    width: colWidth - 4,
  };
}

interface DayColProps {
  date: Date;
  events: CalendarEvent[];
  colWidth: number;
  onEventPress: (id: string) => void;
  onSlotPress: (date: string, time: string) => void;
}

function DayColumn({ date, events, colWidth, onEventPress, onSlotPress }: DayColProps) {
  const dateStr = toDateString(date);
  const timedEvents = events.filter((e) => !e.isAllDay && e.startTime);

  return (
    <View style={[styles.dayCol, { width: colWidth, height: HOUR_HEIGHT * 24 }]}>
      {/* Hour grid lines + tap zones */}
      {HOURS.map((h) => (
        <Pressable
          key={h}
          style={[styles.hourSlot, { top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }]}
          onPress={() => onSlotPress(dateStr, `${String(h).padStart(2, '0')}:00`)}
        />
      ))}

      {/* Timed events */}
      {timedEvents.map((ev) => {
        const { top, height, left, width } = getEventStyle(ev, colWidth);
        const catColor = Colors.eventCategories[ev.category];
        return (
          <Pressable
            key={`${ev.id}_${ev.date}`}
            style={[styles.eventBlock, { top, height, left, width, backgroundColor: catColor }]}
            onPress={() => onEventPress(ev.id)}
          >
            <Text style={styles.eventTitle} numberOfLines={2}>{ev.title}</Text>
            {height > 40 && ev.startTime && (
              <Text style={styles.eventTime}>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function WeekView({ onEventPress, onSlotPress }: WeekViewProps) {
  const { width } = useWindowDimensions();
  const allEvents = useCalendarStore((s) => s.events);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const selectDate = useCalendarStore((s) => s.selectDate);

  const weekStart = useMemo(
    () => getWeekStart(parseISO(selectedDate)),
    [selectedDate]
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const rangeStart = toDateString(weekStart);
  const rangeEnd = toDateString(addDays(weekStart, 6));

  const weekEvents = useMemo(
    () => expandEvents(allEvents, rangeStart, rangeEnd),
    [allEvents, rangeStart, rangeEnd]
  );

  const colWidth = Math.floor((width - TIME_COL_WIDTH) / 7);

  const allDayEvents = weekEvents.filter((e) => e.isAllDay);

  const eventsForDay = (date: Date) => {
    const ds = toDateString(date);
    return weekEvents.filter((e) => e.date === ds);
  };

  const goToPrevWeek = () => selectDate(toDateString(addDays(weekStart, -7)));
  const goToNextWeek = () => selectDate(toDateString(addDays(weekStart, 7)));

  const weekLabel = `${format(weekStart, 'd. MMM', { locale: de })} – ${format(addDays(weekStart, 6), 'd. MMM yyyy', { locale: de })}`;

  return (
    <View style={styles.container}>
      {/* Week navigation */}
      <View style={styles.weekNav}>
        <Pressable onPress={goToPrevWeek} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <Pressable onPress={goToNextWeek} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
        </Pressable>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        <View style={{ width: TIME_COL_WIDTH }} />
        {weekDays.map((day) => {
          const ds = toDateString(day);
          const isSelected = ds === selectedDate;
          const today = isToday(day);
          return (
            <Pressable
              key={ds}
              style={[styles.dayHeader, { width: colWidth }]}
              onPress={() => selectDate(ds)}
            >
              <Text style={[styles.dayName, today && styles.todayText]}>
                {format(day, 'EEE', { locale: de })}
              </Text>
              <View style={[styles.dayNumCircle, isSelected && styles.selectedCircle, today && !isSelected && styles.todayCircle]}>
                <Text style={[styles.dayNum, (isSelected || today) && styles.dayNumHighlight]}>
                  {format(day, 'd')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <View style={styles.allDayRow}>
          <View style={[styles.allDayGutter, { width: TIME_COL_WIDTH }]}>
            <Text style={styles.allDayLabel}>Ganzt.</Text>
          </View>
          <View style={styles.allDayEvents}>
            {allDayEvents.map((ev) => {
              const catColor = Colors.eventCategories[ev.category];
              return (
                <Pressable
                  key={`${ev.id}_${ev.date}`}
                  style={[styles.allDayChip, { backgroundColor: catColor }]}
                  onPress={() => onEventPress(ev.id)}
                >
                  <Text style={styles.allDayChipText} numberOfLines={1}>{ev.title}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Time grid */}
      <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Time labels */}
          <View style={{ width: TIME_COL_WIDTH }}>
            {HOURS.map((h) => (
              <View key={h} style={[styles.hourLabel, { height: HOUR_HEIGHT }]}>
                <Text style={styles.hourText}>{`${String(h).padStart(2, '0')}:00`}</Text>
              </View>
            ))}
          </View>

          {/* Day columns */}
          {weekDays.map((day) => (
            <DayColumn
              key={toDateString(day)}
              date={day}
              events={eventsForDay(day)}
              colWidth={colWidth}
              onEventPress={onEventPress}
              onSlotPress={onSlotPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },

  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navBtn: { padding: 4 },
  weekLabel: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },

  dayHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background.primary,
  },
  dayHeader: { alignItems: 'center', paddingVertical: 6 },
  dayName: { fontSize: 11, color: Colors.text.secondary, textTransform: 'uppercase' },
  todayText: { color: Colors.primary },
  dayNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  selectedCircle: { backgroundColor: Colors.primary },
  todayCircle: { backgroundColor: Colors.primaryLight },
  dayNum: { fontSize: 15, color: Colors.text.primary },
  dayNumHighlight: { color: Colors.primary, fontWeight: '600' },

  allDayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 32,
    alignItems: 'center',
    paddingVertical: 4,
  },
  allDayGutter: { alignItems: 'center' },
  allDayLabel: { fontSize: 10, color: Colors.text.disabled },
  allDayEvents: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingRight: 4 },
  allDayChip: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 120,
  },
  allDayChipText: { fontSize: 11, color: Colors.text.inverse, fontWeight: '500' },

  divider: { height: 1, backgroundColor: Colors.border },

  gridScroll: { flex: 1 },
  gridContainer: { flexDirection: 'row' },

  hourLabel: { justifyContent: 'flex-start', paddingTop: 2, paddingHorizontal: 4 },
  hourText: { fontSize: 10, color: Colors.text.disabled, textAlign: 'right' },

  dayCol: { position: 'relative', borderLeftWidth: 1, borderLeftColor: Colors.border },
  hourSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },

  eventBlock: {
    position: 'absolute',
    borderRadius: 4,
    padding: 3,
    overflow: 'hidden',
  },
  eventTitle: { fontSize: 11, color: Colors.text.inverse, fontWeight: '600' },
  eventTime: { fontSize: 10, color: Colors.text.inverse, opacity: 0.9 },
});
