# Meine App

Cross-platform Business-App für Webdesigner / Freelancer. Läuft als native iOS-App und im Web-Browser (Windows/Mac).

## Tech-Stack

| Was | Womit |
|-----|-------|
| Framework | Expo SDK 54 + Expo Router 6 |
| Sprache | TypeScript (strict) |
| State-Management | Zustand |
| Datenspeicherung | AsyncStorage (einfache Daten), expo-sqlite (geplant für Finanzen) |
| Icons | @expo/vector-icons (Ionicons) |
| Styling | React Native StyleSheet |
| Datum/Zeit | date-fns |
| KI | @anthropic-ai/sdk (Anthropic Claude) |

## Module

| # | Name | Status | Datei |
|---|------|--------|-------|
| 1 | Kalender | ✅ Implementiert | `app/(tabs)/index.tsx` |
| 2 | To-Do Liste | ✅ Implementiert | `app/(tabs)/todos.tsx` |
| 3 | Notizen | ✅ Implementiert | `app/(tabs)/notes.tsx` |
| 4 | Tabellen | ✅ Implementiert | `app/(tabs)/spreadsheet.tsx` |
| 5 | Finanzen | ✅ Implementiert | `app/(tabs)/finance.tsx` |
| 6 | KI-Chat | ✅ Implementiert | `app/(tabs)/ai-chat.tsx` |

## Ordnerstruktur

```
app/               → Screens (Expo Router: jede Datei = eine Route)
  (tabs)/          → Tab-Navigation (alle 6 Module)
  calendar/        → Kalender-Modals (neuer Termin, Termin bearbeiten)
  todos/           → To-Do-Modals (neue Aufgabe, Aufgabe bearbeiten)
  notes/           → Notiz-Editor (Vollbild, kein Modal)
components/        → Wiederverwendbare UI-Komponenten
  calendar/        → Kalender-spezifische Komponenten
types/             → TypeScript-Interfaces
storage/           → Datenpersistenz (AsyncStorage-Funktionen)
store/             → Zustand-Stores (State Management)
constants/         → App-weite Konstanten (Farben etc.)
```

## Entwicklungsbefehle

```bash
npx expo start          # Entwicklungsserver starten
npx expo start --web    # Nur im Browser öffnen
npx tsc --noEmit        # TypeScript-Fehler prüfen
```

## Wichtige Konventionen

- **Pfad-Alias**: `@/` verweist auf den Projekt-Root (statt `../../`)
- **Datum-Format**: Immer als String `"YYYY-MM-DD"` speichern, nie als `Date`-Objekt
- **Farben**: Immer aus `@/constants/Colors` importieren
- **Zustand-Selektoren**: Außerhalb des Stores als separate Funktionen definieren
- **Sprache**: Deutsche UI-Texte, englische Code-Namen

## Umgebungsvariablen

Erstelle `.env.local` (diese Datei nie committen!):

```
EXPO_PUBLIC_ANTHROPIC_API_KEY=dein_api_key_hier
```

**Sicherheitshinweis**: Das `EXPO_PUBLIC_`-Präfix macht den Key im App-Bundle sichtbar.
Für die Entwicklung ist das ok. Für eine öffentliche App sollte ein eigener Backend-Server
die API-Anfragen weiterleiten.

## AsyncStorage-Schlüssel

| Schlüssel | Inhalt |
|-----------|--------|
| `calendar_events` | Array von `CalendarEvent`-Objekten |
| `todo_items` | Array von `TodoItem`-Objekten |
| `todo_projects` | Array von `TodoProject`-Objekten |
| `notes` | Array von `Note`-Objekten |
| `finance_entries` | (geplant) |
