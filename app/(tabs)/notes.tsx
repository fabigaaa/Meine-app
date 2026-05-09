import { useEffect, useMemo } from 'react';
import { View, FlatList, TextInput, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { useNoteStore, selectFilteredNotes } from '@/store/noteStore';
import { NoteListItem } from '@/components/notes/NoteListItem';
import { Colors } from '@/constants/Colors';

export default function NotesScreen() {
  const { loadAll, setSearch, searchQuery, createNote, isLoading, notes: allNotes } = useNoteStore();
  const notes = useMemo(
    () => selectFilteredNotes({ notes: allNotes, searchQuery } as Parameters<typeof selectFilteredNotes>[0]),
    [allNotes, searchQuery]
  );

  useEffect(() => {
    loadAll();
  }, []);

  const handleNewNote = async () => {
    const now = new Date().toISOString();
    const note = {
      id: uuid.v4() as string,
      title: 'Neue Notiz',
      content: '',
      createdAt: now,
      updatedAt: now,
    };
    await createNote(note);
    router.push(`/notes/${note.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Suchleiste */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearch}
            placeholder="Notizen durchsuchen…"
            placeholderTextColor={Colors.text.disabled}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Liste */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteListItem
              note={item}
              onPress={() => router.push(`/notes/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Keine Ergebnisse' : 'Noch keine Notizen'}
              </Text>
              {!searchQuery && (
                <Text style={styles.emptyHint}>Tippe auf + um eine neue Notiz zu erstellen</Text>
              )}
            </View>
          }
          contentContainerStyle={notes.length === 0 ? styles.emptyContainer : undefined}
        />
      )}

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={handleNewNote}
        accessibilityLabel="Neue Notiz"
      >
        <Ionicons name="add" size={28} color={Colors.text.inverse} />
      </Pressable>
    </SafeAreaView>
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
  loader: { flex: 1 },
  emptyContainer: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 60 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 17, fontWeight: '600', color: Colors.text.primary },
  emptyHint: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', paddingHorizontal: 32 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
