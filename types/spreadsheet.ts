export interface SpreadsheetTable {
  id: string;
  name: string;
  rowCount: number;
  colCount: number;
  // Schlüssel: "zeile:spalte" → z.B. "0:0", "2:3"
  // Nur befüllte Zellen werden gespeichert (spart Speicher)
  cells: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Spaltenbuchstaben erzeugen: 0→A, 1→B, ..., 25→Z, 26→AA, ...
export function colLabel(index: number): string {
  let label = '';
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

export const CELL_WIDTH = 120;
export const CELL_HEIGHT = 40;
export const ROW_NUM_WIDTH = 44;

export const DEFAULT_ROW_COUNT = 20;
export const DEFAULT_COL_COUNT = 6;
