import { SpreadsheetTable } from '@/types/spreadsheet';

// ─── Hilfsfunktionen ──────────────────────────────────────────────────

/** "A" → 0, "B" → 1, "AA" → 26, usw. */
function colIndexFromLabel(label: string): number {
  let index = 0;
  for (const c of label.toUpperCase()) {
    index = index * 26 + (c.charCodeAt(0) - 64);
  }
  return index - 1;
}

/** Parst einen Zellbezug wie "A1" → { row: 0, col: 0 } */
function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = ref.trim().match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  return {
    col: colIndexFromLabel(match[1]),
    row: parseInt(match[2], 10) - 1,
  };
}

/** Gibt alle Zellen eines Bereichs zurück: "A1:B3" */
function expandRange(range: string): Array<{ row: number; col: number }> {
  const parts = range.split(':');
  if (parts.length === 1) {
    const ref = parseCellRef(parts[0]);
    return ref ? [ref] : [];
  }
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return [];

  const cells: Array<{ row: number; col: number }> = [];
  for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
    for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}

/** Roher Zellwert aus der Tabelle */
function getRawValue(table: SpreadsheetTable, row: number, col: number): string {
  return table.cells[`${row}:${col}`] ?? '';
}

/** Zellwert als Zahl (rekursiv ausgewertet) */
function getNumericValue(
  table: SpreadsheetTable,
  row: number,
  col: number,
  visited: Set<string>
): number {
  const key = `${row}:${col}`;
  if (visited.has(key)) return 0; // Zirkelreferenz abfangen
  const raw = getRawValue(table, row, col);
  const evaluated = evaluateRaw(table, raw, new Set([...visited, key]));
  const num = parseFloat(evaluated);
  return isNaN(num) ? 0 : num;
}

// ─── Einfacher arithmetischer Parser ─────────────────────────────────

function parseArithmetic(expr: string): number {
  const tokens = tokenize(expr);
  let pos = 0;

  function peek(): string { return tokens[pos] ?? ''; }
  function consume(): string { return tokens[pos++] ?? ''; }

  function parseExpr(): number {
    let result = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const t = parseTerm();
      result = op === '+' ? result + t : result - t;
    }
    return result;
  }

  function parseTerm(): number {
    let result = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const f = parseFactor();
      result = op === '*' ? result * f : f !== 0 ? result / f : NaN;
    }
    return result;
  }

  function parseFactor(): number {
    if (peek() === '(') {
      consume(); // '('
      const v = parseExpr();
      consume(); // ')'
      return v;
    }
    if (peek() === '-') {
      consume();
      return -parseFactor();
    }
    return parseFloat(consume()) || 0;
  }

  return parseExpr();
}

function tokenize(expr: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[\+\-\*\/\(\)]/.test(c)) { result.push(c); i++; continue; }
    if (/[\d\.]/.test(c)) {
      let num = '';
      while (i < expr.length && /[\d\.]/.test(expr[i])) num += expr[i++];
      result.push(num);
      continue;
    }
    i++; // unbekanntes Zeichen überspringen
  }
  return result;
}

// ─── Haupt-Evaluator ─────────────────────────────────────────────────

function evaluateRaw(
  table: SpreadsheetTable,
  rawValue: string,
  visited: Set<string>
): string {
  if (!rawValue.startsWith('=')) return rawValue;

  try {
    const formula = rawValue.slice(1).trim().toUpperCase();

    // ── Funktionsformeln: SUM, AVG, COUNT, MAX, MIN, ROUND ──
    const funcMatch = formula.match(/^(\w+)\((.+)\)$/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const arg = funcMatch[2].trim();
      const cells = expandRange(arg);

      switch (funcName) {
        case 'SUM': {
          const total = cells.reduce(
            (acc, { row, col }) => acc + getNumericValue(table, row, col, visited), 0
          );
          return formatNum(total);
        }
        case 'AVG':
        case 'AVERAGE': {
          if (!cells.length) return '0';
          const avg =
            cells.reduce((acc, { row, col }) => acc + getNumericValue(table, row, col, visited), 0) /
            cells.length;
          return formatNum(avg);
        }
        case 'COUNT': {
          const count = cells.filter(({ row, col }) => getRawValue(table, row, col) !== '').length;
          return String(count);
        }
        case 'MAX': {
          if (!cells.length) return '0';
          const max = Math.max(...cells.map(({ row, col }) => getNumericValue(table, row, col, visited)));
          return formatNum(max);
        }
        case 'MIN': {
          if (!cells.length) return '0';
          const min = Math.min(...cells.map(({ row, col }) => getNumericValue(table, row, col, visited)));
          return formatNum(min);
        }
        case 'ROUND': {
          const parts = arg.split(',');
          const val = getNumericValue(table, ...Object.values(parseCellRef(parts[0].trim()) ?? { row: 0, col: 0 }) as [number, number], visited);
          const decimals = parseInt(parts[1]?.trim() ?? '0', 10);
          return formatNum(Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals));
        }
        default:
          return '#NAME?';
      }
    }

    // ── Arithmetik mit Zellbezügen: =A1+B1*2 ──
    const withValues = formula.replace(/([A-Z]+\d+)/g, (match) => {
      const ref = parseCellRef(match);
      if (!ref) return '0';
      return String(getNumericValue(table, ref.row, ref.col, visited));
    });

    const result = parseArithmetic(withValues);
    return isNaN(result) ? '#FEHLER' : formatNum(result);
  } catch {
    return '#FEHLER';
  }
}

function formatNum(n: number): string {
  // Keine unnötigen Dezimalstellen: 1.5 → "1.5", 2.0 → "2"
  return Number(n.toFixed(10)).toString();
}

// ─── Export ───────────────────────────────────────────────────────────

/** Öffentliche Funktion: Formel oder Rohwert einer Zelle auswerten. */
export function evaluateCell(table: SpreadsheetTable, rawValue: string): string {
  if (!rawValue.startsWith('=')) return rawValue;
  return evaluateRaw(table, rawValue, new Set());
}

/** Gibt an ob ein Wert eine Formel ist. */
export function isFormula(value: string): boolean {
  return value.startsWith('=');
}
