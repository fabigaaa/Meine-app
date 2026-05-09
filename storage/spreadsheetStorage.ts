import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpreadsheetTable } from '@/types/spreadsheet';

const STORAGE_KEY = 'spreadsheet_tables';

export async function loadTables(): Promise<SpreadsheetTable[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as SpreadsheetTable[]) : [];
  } catch {
    return [];
  }
}

async function saveTables(tables: SpreadsheetTable[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
}

export async function addTable(table: SpreadsheetTable): Promise<void> {
  const tables = await loadTables();
  tables.push(table);
  await saveTables(tables);
}

export async function updateTable(updated: SpreadsheetTable): Promise<void> {
  const tables = await loadTables();
  const i = tables.findIndex((t) => t.id === updated.id);
  if (i === -1) throw new Error(`Table ${updated.id} not found`);
  tables[i] = updated;
  await saveTables(tables);
}

export async function deleteTable(id: string): Promise<void> {
  const tables = await loadTables();
  await saveTables(tables.filter((t) => t.id !== id));
}
