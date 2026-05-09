import { create } from 'zustand';
import { SpreadsheetTable, DEFAULT_ROW_COUNT, DEFAULT_COL_COUNT } from '@/types/spreadsheet';
import {
  loadTables, addTable, updateTable, deleteTable,
} from '@/storage/spreadsheetStorage';

interface SpreadsheetState {
  tables: SpreadsheetTable[];
  activeTableId: string | null;
  isLoading: boolean;

  loadAll: () => Promise<void>;
  setActiveTable: (id: string) => void;
  createTable: (table: SpreadsheetTable) => Promise<void>;
  renameTable: (id: string, name: string) => Promise<void>;
  setCellValue: (tableId: string, row: number, col: number, value: string) => Promise<void>;
  addRow: (tableId: string) => Promise<void>;
  addCol: (tableId: string) => Promise<void>;
  removeTable: (id: string) => Promise<void>;
}

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

export const useSpreadsheetStore = create<SpreadsheetState>((set, get) => ({
  tables: [],
  activeTableId: null,
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    const tables = await loadTables();
    set({
      tables,
      activeTableId: tables.length > 0 ? tables[0].id : null,
      isLoading: false,
    });
  },

  setActiveTable: (id) => set({ activeTableId: id }),

  createTable: async (table) => {
    await addTable(table);
    set((s) => ({ tables: [...s.tables, table], activeTableId: table.id }));
  },

  renameTable: async (id, name) => {
    const { tables } = get();
    const updated = tables.map((t) =>
      t.id === id ? { ...t, name, updatedAt: new Date().toISOString() } : t
    );
    const table = updated.find((t) => t.id === id)!;
    await updateTable(table);
    set({ tables: updated });
  },

  setCellValue: async (tableId, row, col, value) => {
    const { tables } = get();
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const key = cellKey(row, col);
    const newCells = { ...table.cells };
    if (value === '') {
      delete newCells[key]; // leere Zellen nicht speichern
    } else {
      newCells[key] = value;
    }
    const updated = { ...table, cells: newCells, updatedAt: new Date().toISOString() };
    await updateTable(updated);
    set((s) => ({
      tables: s.tables.map((t) => (t.id === tableId ? updated : t)),
    }));
  },

  addRow: async (tableId) => {
    const { tables } = get();
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const updated = { ...table, rowCount: table.rowCount + 5, updatedAt: new Date().toISOString() };
    await updateTable(updated);
    set((s) => ({ tables: s.tables.map((t) => (t.id === tableId ? updated : t)) }));
  },

  addCol: async (tableId) => {
    const { tables } = get();
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const updated = { ...table, colCount: table.colCount + 1, updatedAt: new Date().toISOString() };
    await updateTable(updated);
    set((s) => ({ tables: s.tables.map((t) => (t.id === tableId ? updated : t)) }));
  },

  removeTable: async (id) => {
    await deleteTable(id);
    const { tables } = get();
    const remaining = tables.filter((t) => t.id !== id);
    set({ tables: remaining, activeTableId: remaining.length > 0 ? remaining[0].id : null });
  },
}));

// Hilfsfunktion: Zellwert abrufen
export function getCellValue(table: SpreadsheetTable, row: number, col: number): string {
  return table.cells[`${row}:${col}`] ?? '';
}

// Hilfsfunktion: Neue leere Tabelle erzeugen
export function makeNewTable(id: string, name: string): SpreadsheetTable {
  const now = new Date().toISOString();
  return {
    id,
    name,
    rowCount: DEFAULT_ROW_COUNT,
    colCount: DEFAULT_COL_COUNT,
    cells: {},
    createdAt: now,
    updatedAt: now,
  };
}
