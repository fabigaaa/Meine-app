import { create } from 'zustand';
import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, SYSTEM_PROMPT } from '@/types/chat';
import { useSettingsStore } from '@/store/settingsStore';

// Fallback: API-Key aus der .env.local Datei
const ENV_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

interface ChatState {
  messages: ChatMessage[];
  inputText: string;
  isLoading: boolean;
  error: string | null;

  setInput: (text: string) => void;
  sendMessage: () => Promise<void>;
  clearConversation: () => void;
}

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  inputText: '',
  isLoading: false,
  error: null,

  setInput: (text) => set({ inputText: text }),

  clearConversation: () => set({ messages: [], error: null }),

  sendMessage: async () => {
    const { inputText, messages } = get();
    const text = inputText.trim();
    if (!text || get().isLoading) return;

    // API-Key: zuerst aus Einstellungen, dann aus .env.local
    const settingsKey = useSettingsStore.getState().anthropicApiKey;
    const API_KEY = (settingsKey && settingsKey !== 'dein_api_key_hier')
      ? settingsKey
      : ENV_API_KEY;
    const AI_MODEL = useSettingsStore.getState().aiModel || 'claude-sonnet-4-6';

    if (!API_KEY || API_KEY === 'dein_api_key_hier') {
      set({ error: 'Kein API-Key konfiguriert. Trage deinen Anthropic-Key in den Einstellungen ein.' });
      return;
    }

    // Nutzer-Nachricht sofort anzeigen
    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    // Platzhalter für Claude-Antwort (wird per Streaming befüllt)
    const assistantId = makeId();
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    set({
      messages: [...messages, userMessage, assistantPlaceholder],
      inputText: '',
      isLoading: true,
      error: null,
    });

    try {
      const client = new Anthropic({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true, // Für Expo Web (Browser-Umgebung)
      });

      // Nachrichtenhistorie für die API aufbauen
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Streaming-Anfrage an Claude
      const stream = await client.messages.stream({
        model: AI_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      });

      let accumulated = '';

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          accumulated += chunk.delta.text;

          // Nachricht in Echtzeit aktualisieren
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, isStreaming: true }
                : m
            ),
          }));
        }
      }

      // Streaming beendet: isStreaming-Flag entfernen
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        ),
        isLoading: false,
      }));
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : 'Unbekannter Fehler aufgetreten.';

      // Platzhalter durch Fehlermeldung ersetzen
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Fehler: ${errorText}`, isStreaming: false }
            : m
        ),
        isLoading: false,
        error: errorText,
      }));
    }
  },
}));
