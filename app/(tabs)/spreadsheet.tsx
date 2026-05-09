import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { useSpreadsheetStore, makeNewTable } from '@/store/spreadsheetStore';
import { SpreadsheetGrid } from '@/components/spreadsheet/SpreadsheetGrid';
import { SheetTabs } from '@/components/spreadsheet/SheetTabs';
import { Colors } from '@/constants/Colors';

export default function SpreadsheetScreen() {
  const {
    loadAll, tables, activeTableId, isLoading,
    createTable, addRow, addCol,
  } = useSpreadsheetStore();

  useEffect(() => {
    loadAll();
  }, []);

  const activeTable = tables.find((t) => t.id === activeTableId) ?? null;

  const handleAddTable = () => {
    const number = tables.length + 1;
    createTable(makeNewTable(uuid.v4() as string, `Tabelle ${number}`));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (tables.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Noch keine Tabellen</Text>
          <Text style={styles.emptyHint}>Erstelle deine erste Tabelle</Text>
          <Pressable style={styles.emptyButton} onPress={handleAddTable}>
            <Text style={styles.emptyButtonText}>Neue Tabelle erstellen</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Sheet-Tabs (wie Blätter in Excel) */}
      <SheetTabs
        tables={tables}
        activeTableId={activeTableId}
        onAdd={handleAddTable}
      />

      {/* Grid */}
      {activeTable && <SpreadsheetGrid table={activeTable} />}

      {/* Toolbar: Zeile / Spalte hinzufügen */}
      {activeTable && (
        <View style={styles.toolbar}>
          <Pressable
            style={styles.toolbarBtn}
            onPress={() => addRow(activeTable.id)}
          >
            <Ionicons name="add" size={16} color={Colors.primary} />
            <Text style={styles.toolbarBtnText}>5 Zeilen</Text>
          </Pressable>
          <View style={styles.toolbarDivider} />
          <Pressable
            style={styles.toolbarBtn}
            onPress={() => addCol(activeTable.id)}
          >
            <Ionicons name="add" size={16} color={Colors.primary} />
            <Text style={styles.toolbarBtnText}>Spalte</Text>
          </Pressable>
          <View style={styles.toolbarSpacer} />
          <Text style={styles.toolbarInfo}>
            {activeTable.rowCount} × {activeTable.colCount}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  loader: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.text.primary },
  emptyHint: { fontSize: 15, color: Colors.text.secondary },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  emptyButtonText: { color: Colors.text.inverse, fontSize: 16, fontWeight: '600' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background.secondary,
  },
  toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  toolbarBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  toolbarDivider: { width: 1, height: 18, backgroundColor: Colors.border, marginHorizontal: 4 },
  toolbarSpacer: { flex: 1 },
  toolbarInfo: { fontSize: 12, color: Colors.text.disabled },
});
