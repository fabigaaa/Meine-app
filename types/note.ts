export interface Note {
  id: string;
  title: string;    // Erster Satz / manueller Titel
  content: string;  // Kompletter Textinhalt (inkl. Titel-Zeile)
  createdAt: string;
  updatedAt: string;
}

// Hilfsfunktion: Titel aus dem Inhalt ableiten
export function deriveTitleFromContent(content: string): string {
  const firstLine = content.split('\n')[0].trim();
  if (!firstLine) return 'Neue Notiz';
  return firstLine.length > 60 ? firstLine.slice(0, 60) + '…' : firstLine;
}

// Hilfsfunktion: Vorschautext (zweite Zeile / Rest)
export function derivePreviewFromContent(content: string): string {
  const lines = content.split('\n').filter((l) => l.trim());
  const preview = lines.slice(1).join(' ').trim();
  if (!preview) return 'Keine weiteren Inhalte';
  return preview.length > 80 ? preview.slice(0, 80) + '…' : preview;
}
