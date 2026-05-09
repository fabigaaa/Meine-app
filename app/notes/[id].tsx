import { useState, useLayoutEffect } from 'react';
import { View, Pressable, Alert, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNoteStore } from '@/store/noteStore';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Colors } from '@/constants/Colors';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

const STATUS_LABEL: Record<SaveStatus, string> = {
  saved: 'Gespeichert',
  saving: 'Speichern…',
  unsaved: 'Nicht gespeichert',
};

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, removeNote } = useNoteStore();
  const navigation = useNavigation();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const note = notes.find((n) => n.id === id);

  // Header-Buttons dynamisch setzen
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleDelete}
          style={{ paddingHorizontal: 8 }}
          accessibilityLabel="Notiz löschen"
        >
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </Pressable>
      ),
      headerTitle: () => (
        <Text style={{ fontSize: 13, color: Colors.text.secondary }}>
          {STATUS_LABEL[saveStatus]}
        </Text>
      ),
    });
  }, [saveStatus]);

  if (!note) {
    router.back();
    return null;
  }

  const handleDelete = () => {
    Alert.alert('Notiz löschen', 'Diese Notiz wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await removeNote(note.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <NoteEditor note={note} onSaveStatusChange={setSaveStatus} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
});
