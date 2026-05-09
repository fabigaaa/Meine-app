import { create } from 'zustand';
import { format } from 'date-fns';
import { ChatMessage, ChatAction, buildSystemPrompt } from '@/types/chat';
import { useSettingsStore } from '@/store/settingsStore';
import { useCalendarStore } from '@/store/calendarStore';
import { useNoteStore } from '@/store/noteStore';
import { CalendarEvent } from '@/types/calendar';
import { Note } from '@/types/note';

// Groq API — kostenlos unter console.groq.com
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// ─── Hilfsfunktionen ──────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Parst <ACTION>...</ACTION>-Blöcke aus einer KI-Antwort */
function parseActions(text: string): { cleanText: string; actions: ChatAction[] } {
  const actions: ChatAction[] = [];
  const cleanText = text
    .replace(/<ACTION>([\s\S]*?)<\/ACTION>/g, (_, json) => {
      try {
        const action = JSON.parse(json.trim());
        if (action.type === 'ADD_EVENT' || action.type === 'ADD_NOTE') {
          actions.push(action);
        }
      } catch {
        // ungültiges JSON ignorieren
      }
      return '';
    })
    .trim();
  return { cleanText, actions };
}

// ─── Store-Interface ─────────────────────────────────────────────────

interface ChatState {
  messages: ChatMessage[];
  inputText: string;
  isLoading: boolean;
  error: string | null;

  setInput: (text: string) => void;
  sendMessage: () => Promise<void>;
  clearConversation: () => void;
  executeAction: (messageId: string, action: ChatAction) => Promise<void>;
  dismissAction: (messageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  inputText: '',
  isLoading: false,
  error: null,

  setInput: (text) => set({ inputText: text }),
  clearConversation: () => set({ messages: [], error: null }),

  // ── Nachricht abschicken ────────────────────────────────────────────

  sendMessage: async () => {
    const { inputText, messages } = get();
    const text = inputText.trim();
    if (!text || get().isLoading) return;

    // API-Key aus Einstellungen oder Env
    const settings = useSettingsStore.getState();
    const apiKey = settings.groqApiKey?.trim() || process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
    const model = settings.groqModel || DEFAULT_MODEL;

    if (!apiKey) {
      set({
        error: 'Kein Groq API-Key konfiguriert. Trage deinen kostenlosen Key in den Einstellungen ein.',
      });
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

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
      // Nachrichtenhistorie aufbauen
      const apiMessages = [
        { role: 'system', content: buildSystemPrompt(today) },
        ...[...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          stream: true,
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API Fehler ${response.status}: ${err.slice(0, 200)}`);
      }

      // ── SSE-Stream lesen ────────────────────────────────────────────
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (!reader) throw new Error('Kein Response-Body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta: string = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              accumulated += delta;
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: accumulated, isStreaming: true }
                    : m
                ),
              }));
            }
          } catch {
            // Ungültiges JSON-Chunk überspringen
          }
        }
      }

      // ── Aktionen aus der fertigen Antwort parsen ──────────────────
      const { cleanText, actions } = parseActions(accumulated);

      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: cleanText || accumulated,
                isStreaming: false,
                actions: actions.length > 0 ? actions : undefined,
                actionsExecuted: false,
              }
            : m
        ),
        isLoading: false,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? { ...m, content: `❌ Fehler: ${msg}`, isStreaming: false }
            : m
        ),
        isLoading: false,
        error: msg,
      }));
    }
  },

  // ── Aktion ausführen (Nutzer bestätigt) ────────────────────────────

  executeAction: async (messageId, action) => {
    try {
      if (action.type === 'ADD_EVENT') {
        const now = new Date().toISOString();
        const event: CalendarEvent = {
          id: makeId(),
          title: action.title,
          date: action.date,
          startTime: action.startTime,
          endTime: action.endTime,
          description: action.description,
          category: (action.category as CalendarEvent['category']) ?? 'other',
          isAllDay: !action.startTime,
          createdAt: now,
          updatedAt: now,
        };
        await useCalendarStore.getState().createEvent(event);
      } else if (action.type === 'ADD_NOTE') {
        const now = new Date().toISOString();
        const note: Note = {
          id: makeId(),
          title: action.title,
          content: action.content,
          createdAt: now,
          updatedAt: now,
        };
        await useNoteStore.getState().createNote(note);
      }

      // Aktion als ausgeführt markieren
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, actionsExecuted: true } : m
        ),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Aktion fehlgeschlagen' });
    }
  },

  // ── Aktion ablehnen ────────────────────────────────────────────────

  dismissAction: (messageId) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, actionsExecuted: true } : m
      ),
    }));
  },
}));
