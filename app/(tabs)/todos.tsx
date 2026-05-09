import { useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTodoStore, selectFilteredTodos, FilterTab } from '@/store/todoStore';
import { TodoListItem } from '@/components/todos/TodoListItem';
import { Colors } from '@/constants/Colors';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'open', label: 'Offen' },
  { value: 'done', label: 'Erledigt' },
  { value: 'all', label: 'Alle' },
];

export default function TodosScreen() {
  const { loadAll, activeFilter, setFilter, isLoading, items, activeProjectId } = useTodoStore();
  const filteredItems = useMemo(
    () => selectFilteredTodos({ items, activeFilter, activeProjectId } as Parameters<typeof selectFilteredTodos>[0]),
    [items, activeFilter, activeProjectId]
  );

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filter-Leiste */}
      <View style={styles.filterBar}>
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.value}
            style={[styles.filterTab, activeFilter === tab.value && styles.filterTabActive]}
            onPress={() => setFilter(tab.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.value && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Liste */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoListItem
              item={item}
              onPress={() => router.push(`/todos/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>{activeFilter === 'done' ? '🎉' : '✅'}</Text>
              <Text style={styles.emptyText}>
                {activeFilter === 'done'
                  ? 'Noch nichts erledigt'
                  : 'Keine offenen Aufgaben'}
              </Text>
              {activeFilter !== 'done' && (
                <Text style={styles.emptyHint}>Tippe auf + um eine hinzuzufügen</Text>
              )}
            </View>
          }
          contentContainerStyle={filteredItems.length === 0 ? styles.emptyContainer : undefined}
        />
      )}

      {/* Hinzufügen-Button (FAB) */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/todos/new-todo')}
        accessibilityLabel="Neue Aufgabe"
      >
        <Ionicons name="add" size={28} color={Colors.text.inverse} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    gap: 0,
  },
  filterTab: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterTabActive: { borderBottomColor: Colors.primary },
  filterTabText: { fontSize: 15, color: Colors.text.secondary },
  filterTabTextActive: { color: Colors.primary, fontWeight: '600' },
  loader: { flex: 1 },
  emptyContainer: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 60 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 17, fontWeight: '600', color: Colors.text.primary },
  emptyHint: { fontSize: 14, color: Colors.text.secondary },
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
