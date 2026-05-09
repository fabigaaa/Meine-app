import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent } from '@/types/calendar';
import { EventListItem } from './EventListItem';
import { Colors } from '@/constants/Colors';

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: string;
  onAddPress: () => void;
  onEventPress: (id: string) => void;
}

export function EventList({ events, selectedDate, onAddPress, onEventPress }: EventListProps) {
  const formattedDate = format(parseISO(selectedDate), 'EEEE, d. MMMM', { locale: de });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateTitle}>{formattedDate}</Text>
        <Pressable
          style={styles.addButton}
          onPress={onAddPress}
          accessibilityLabel="Neuen Termin hinzufügen"
        >
          <Ionicons name="add" size={24} color={Colors.text.inverse} />
        </Pressable>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventListItem event={item} onPress={() => onEventPress(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Keine Termine an diesem Tag</Text>
            <Text style={styles.emptyHint}>Tippe auf + um einen hinzuzufügen</Text>
          </View>
        }
        contentContainerStyle={events.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTitle: { fontSize: 17, fontWeight: '600', color: Colors.text.primary },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 40 },
  emptyText: { fontSize: 16, color: Colors.text.secondary },
  emptyHint: { fontSize: 14, color: Colors.text.disabled },
});
