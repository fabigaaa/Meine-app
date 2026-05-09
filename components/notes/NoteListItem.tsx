import { View, Text, Pressable, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Note, derivePreviewFromContent } from '@/types/note';
import { Colors } from '@/constants/Colors';

interface NoteListItemProps {
  note: Note;
  onPress: () => void;
}

export function NoteListItem({ note, onPress }: NoteListItemProps) {
  const preview = derivePreviewFromContent(note.content);
  const dateLabel = format(parseISO(note.updatedAt), 'd. MMM yyyy', { locale: de });

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
        <Text style={styles.preview} numberOfLines={2}>{preview}</Text>
      </View>
      <Text style={styles.date}>{dateLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  pressed: { backgroundColor: Colors.background.secondary },
  content: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  preview: { fontSize: 13, color: Colors.text.secondary, lineHeight: 18 },
  date: { fontSize: 12, color: Colors.text.disabled, marginTop: 2 },
});
