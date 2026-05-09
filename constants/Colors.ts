export const Colors = {
  primary: '#F97316',        // Orange (Brand)
  primaryLight: '#2A1800',   // Dunkles Orange-Tint für aktive Hintergründe
  secondary: '#4ADE80',      // Grün (Erfolg)
  danger: '#EF4444',         // Rot
  warning: '#FBBF24',        // Gelb

  text: {
    primary: '#FFFFFF',      // Haupttext weiß
    secondary: '#8B9CB3',    // Gedämpfter Text blau-grau
    disabled: '#4A5568',     // Deaktiviert
    inverse: '#0D1117',      // Text auf hellen/orangen Flächen
  },

  background: {
    primary: '#0D1117',      // Haupt-Dunkel (fast schwarz-blau)
    secondary: '#131929',    // Etwas heller für Abschnitte
    card: '#1A2035',         // Karten-Hintergrund
  },

  border: '#1E2D45',         // Dunkle Trennlinie

  calendar: {
    today: '#F97316',
    selected: '#F97316',
    dot: '#F97316',
  },

  eventCategories: {
    meeting: '#F97316',      // Orange
    deadline: '#EF4444',     // Rot
    personal: '#4ADE80',     // Grün
    other: '#8B9CB3',        // Blau-Grau
  },
} as const;
