import { ScrollView, View, Text, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { SpreadsheetTable } from '@/types/spreadsheet';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Colors } from '@/constants/Colors';

interface SheetTabsProps {
  tables: SpreadsheetTable[];
  activeTableId: string | null;
  onAdd: () => void;
}

export function SheetTabs({ tables, activeTableId, onAdd }: SheetTabsProps) {
  const { setActiveTable, renameTable, removeTable } = useSpreadsheetStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleLongPress = (table: SpreadsheetTable) => {
    Alert.alert(table.name, 'Was möchtest du tun?', [
      {
        text: 'Umbenennen',
        onPress: () => {
          setRenamingId(table.id);
          setRenameValue(table.name);
        },
      },
      tables.length > 1
        ? {
            text: 'Löschen',
            style: 'destructive',
            onPress: () =>
              Alert.alert('Tabelle löschen', `"${table.name}" und alle Daten löschen?`, [
                { text: 'Abbrechen', style: 'cancel' },
                { text: 'Löschen', style: 'destructive', onPress: () => removeTable(table.id) },
              ]),
          }
        : { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameTable(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tables.map((t) => {
          const isActive = t.id === activeTableId;
          const isRenaming = renamingId === t.id;

          return (
            <Pressable
              key={t.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTable(t.id)}
              onLongPress={() => handleLongPress(t)}
            >
              {isRenaming ? (
                <TextInput
                  style={styles.tabInput}
                  value={renameValue}
                  onChangeText={setRenameValue}
                  onBlur={commitRename}
                  onSubmitEditing={commitRename}
                  autoFocus
                />
              ) : (
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {t.name}
                </Text>
              )}
            </Pressable>
          );
        })}

        {/* Neue Tabelle */}
        <Pressable style={styles.addTab} onPress={onAdd}>
          <Text style={styles.addTabText}>＋</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background.secondary,
  },
  scrollContent: { paddingHorizontal: 12, gap: 4, paddingVertical: 6 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.text.secondary },
  tabTextActive: { color: Colors.text.inverse, fontWeight: '600' },
  tabInput: {
    fontSize: 13,
    color: Colors.text.primary,
    minWidth: 60,
    padding: 0,
  },
  addTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTabText: { fontSize: 16, color: Colors.primary },
});
