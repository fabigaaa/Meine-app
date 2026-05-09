import { useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SpreadsheetTable,
  colLabel,
  CELL_WIDTH,
  CELL_HEIGHT,
  ROW_NUM_WIDTH,
} from '@/types/spreadsheet';
import { useSpreadsheetStore, getCellValue } from '@/store/spreadsheetStore';
import { evaluateCell, isFormula } from '@/utils/formulaEvaluator';
import { Colors } from '@/constants/Colors';

interface SpreadsheetGridProps {
  table: SpreadsheetTable;
}

interface SelectedCell {
  row: number;
  col: number;
}

export function SpreadsheetGrid({ table }: SpreadsheetGridProps) {
  const { setCellValue } = useSpreadsheetStore();
  const [selected, setSelected] = useState<SelectedCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  // ── Zellauswahl ──────────────────────────────────────────────────

  const handleSelectCell = (row: number, col: number) => {
    if (selected) {
      setCellValue(table.id, selected.row, selected.col, editValue);
    }
    const raw = getCellValue(table, row, col);
    setSelected({ row, col });
    setEditValue(raw);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCellBlur = () => {
    if (selected) {
      setCellValue(table.id, selected.row, selected.col, editValue);
    }
    setSelected(null);
  };

  const handleFormulaBarSubmit = () => {
    if (selected) {
      setCellValue(table.id, selected.row, selected.col, editValue);
    }
  };

  const isSelected = (row: number, col: number) =>
    selected?.row === row && selected?.col === col;

  // ── Formelleiste ─────────────────────────────────────────────────

  const cellRefLabel = selected ? `${colLabel(selected.col)}${selected.row + 1}` : '';

  // ── Header-Zeile ─────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.row}>
      <View style={[styles.headerCell, styles.corner]} />
      {Array.from({ length: table.colCount }, (_, col) => (
        <View key={col} style={[styles.headerCell, { width: CELL_WIDTH }]}>
          <Text style={styles.headerText}>{colLabel(col)}</Text>
        </View>
      ))}
    </View>
  );

  // ── Daten-Zeilen ─────────────────────────────────────────────────

  const renderRow = (row: number) => (
    <View key={row} style={styles.row}>
      <View style={[styles.rowNumCell, { height: CELL_HEIGHT }]}>
        <Text style={styles.rowNumText}>{row + 1}</Text>
      </View>

      {Array.from({ length: table.colCount }, (_, col) => {
        const active = isSelected(row, col);
        const raw = getCellValue(table, row, col);
        const shown = isFormula(raw) ? evaluateCell(table, raw) : raw;
        const isErr = shown.startsWith('#');

        return (
          <Pressable
            key={col}
            style={[
              styles.cell,
              { width: CELL_WIDTH, height: CELL_HEIGHT },
              active && styles.cellActive,
            ]}
            onPress={() => handleSelectCell(row, col)}
          >
            {active ? (
              <TextInput
                ref={inputRef}
                style={[styles.cellInput, isFormula(editValue) && styles.formulaCell]}
                value={editValue}
                onChangeText={setEditValue}
                onBlur={handleCellBlur}
                selectTextOnFocus
                autoCapitalize="characters"
              />
            ) : (
              <Text
                style={[
                  styles.cellText,
                  isErr && styles.errorText,
                  isFormula(raw) && !isErr && styles.computedText,
                ]}
                numberOfLines={1}
              >
                {shown}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────

  return (
    <View style={styles.wrapper}>
      {/* Formelleiste */}
      <View style={styles.formulaBar}>
        <View style={styles.cellRefBox}>
          <Text style={styles.cellRefText}>{cellRefLabel || '—'}</Text>
        </View>
        <Text style={styles.fxText}>fx</Text>
        <TextInput
          style={styles.formulaInput}
          value={selected ? editValue : ''}
          onChangeText={setEditValue}
          onSubmitEditing={handleFormulaBarSubmit}
          placeholder="Wert oder =SUMME(A1:B3)"
          placeholderTextColor={Colors.text.disabled}
          editable={!!selected}
          returnKeyType="done"
        />
        {selected && isFormula(editValue) && (
          <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} style={{ marginRight: 6 }} />
        )}
      </View>

      {/* Tabellen-Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.outerScroll}>
        <ScrollView showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">
          {renderHeader()}
          {Array.from({ length: table.rowCount }, (_, row) => renderRow(row))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },

  formulaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 6,
    gap: 6,
  },
  cellRefBox: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cellRefText: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary },
  fxText: { fontSize: 13, fontStyle: 'italic', color: Colors.primary, fontWeight: '700', width: 20 },
  formulaInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  outerScroll: { flex: 1 },
  row: { flexDirection: 'row' },

  headerCell: {
    height: CELL_HEIGHT,
    width: ROW_NUM_WIDTH,
    backgroundColor: Colors.background.secondary,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: { width: ROW_NUM_WIDTH },
  headerText: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },

  rowNumCell: {
    width: ROW_NUM_WIDTH,
    backgroundColor: Colors.background.secondary,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowNumText: { fontSize: 12, color: Colors.text.secondary },

  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    justifyContent: 'center',
    backgroundColor: Colors.background.card,
  },
  cellActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cellText: { fontSize: 13, color: Colors.text.primary },
  computedText: { color: Colors.secondary },
  errorText: { color: Colors.danger, fontSize: 11 },
  formulaCell: { color: Colors.primary },
  cellInput: { fontSize: 13, color: Colors.text.primary, padding: 0, margin: 0 },
});
