import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarEvent } from '@/types/calendar';
import { Colors } from '@/constants/Colors';

interface EventListItemProps {
  event: CalendarEvent;
  onPress: () => void;
}

const CATEGORY_LABELS: Record<CalendarEvent['category'], string> = {
  meeting: 'Meeting',
  deadline: 'Deadline',
  personal: 'Persönlich',
  other: 'Sonstiges',
};

export function EventListItem({ event, onPress }: EventListItemProps) {
  const categoryColor = Colors.eventCategories[event.category];
  const timeLabel = event.isAllDay
    ? 'Ganztägig'
    : event.startTime
    ? `${event.startTime}${event.endTime ? ' – ' + event.endTime : ''}`
    : '';

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <View style={styles.meta}>
          {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
          <Text style={[styles.category, { color: categoryColor }]}>
            {CATEGORY_LABELS[event.category]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.7 },
  categoryBar: { width: 4 },
  content: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  title: { fontSize: 15, fontWeight: '500', color: Colors.text.primary },
  meta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  time: { fontSize: 13, color: Colors.text.secondary },
  category: { fontSize: 12, fontWeight: '500' },
});
