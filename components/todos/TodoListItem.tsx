import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import { TodoItem, TodoPriority } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { ProjectBadge } from './ProjectBadge';
import { Colors } from '@/constants/Colors';

interface TodoListItemProps {
  item: TodoItem;
  onPress: () => void;
}

const PRIORITY_ICON: Record<TodoPriority, { name: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  high: { name: 'alert-circle', color: Colors.danger },
  medium: { name: 'remove-circle', color: Colors.warning },
  low: { name: 'ellipse-outline', color: Colors.text.disabled },
};

export function TodoListItem({ item, onPress }: TodoListItemProps) {
  const { toggleDone, projects } = useTodoStore();
  const project = projects.find((p) => p.id === item.projectId);
  const priority = PRIORITY_ICON[item.priority];

  const isOverdue = !item.isDone && item.dueDate && isPast(parseISO(item.dueDate + 'T23:59:59'));
  const dueDateLabel = item.dueDate
    ? format(parseISO(item.dueDate), 'd. MMM', { locale: de })
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Checkbox */}
      <Pressable
        style={styles.checkboxArea}
        onPress={() => toggleDone(item.id)}
        hitSlop={8}
        accessibilityLabel={item.isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
      >
        <View style={[styles.checkbox, item.isDone && styles.checkboxDone]}>
          {item.isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </Pressable>

      {/* Inhalt */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Ionicons name={priority.name} size={14} color={priority.color} />
          <Text
            style={[styles.title, item.isDone && styles.titleDone]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>

        <View style={styles.meta}>
          {project && <ProjectBadge project={project} small />}
          {dueDateLabel && (
            <View style={styles.dateChip}>
              <Ionicons
                name="calendar-outline"
                size={11}
                color={isOverdue ? Colors.danger : Colors.text.secondary}
              />
              <Text style={[styles.dateText, isOverdue && styles.dateOverdue]}>
                {dueDateLabel}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  pressed: { backgroundColor: Colors.background.secondary },
  checkboxArea: { padding: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  content: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  title: { flex: 1, fontSize: 15, color: Colors.text.primary, lineHeight: 20 },
  titleDone: { textDecorationLine: 'line-through', color: Colors.text.disabled },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dateChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateText: { fontSize: 11, color: Colors.text.secondary },
  dateOverdue: { color: Colors.danger, fontWeight: '500' },
});
