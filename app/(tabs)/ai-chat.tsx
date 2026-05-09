import { useRef, useEffect } from 'react';
import {
  View, FlatList, Text, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@/store/chatStore';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Colors } from '@/constants/Colors';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const API_KEY_MISSING = !API_KEY || API_KEY === 'dein_api_key_hier';

// Vorschläge für den Einstieg
const SUGGESTIONS = [
  'Schreib eine professionelle E-Mail an einen neuen Kunden',
  'Wie kalkuliere ich meinen Stundensatz als Freelancer?',
  'Erstelle eine kurze Projektbeschreibung für mein Portfolio',
  'Was sind die wichtigsten Punkte in einem Freelancer-Vertrag?',
];

export default function AiChatScreen() {
  const { messages, inputText, isLoading, setInput, sendMessage, clearConversation } =
    useChatStore();
  const listRef = useRef<FlatList>(null);

  // Nach neuer Nachricht automatisch nach unten scrollen
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  const handleClear = () => {
    if (messages.length === 0) return;
    Alert.alert('Gespräch löschen', 'Alle Nachrichten löschen und neu beginnen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: clearConversation },
    ]);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  // ── API-Key fehlt ─────────────────────────────────────────
  if (API_KEY_MISSING) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.setupBox}>
          <Text style={styles.setupEmoji}>🔑</Text>
          <Text style={styles.setupTitle}>API-Key einrichten</Text>
          <Text style={styles.setupText}>
            Um den KI-Chat zu nutzen, brauchst du einen Anthropic-API-Key.
          </Text>
          <View style={styles.setupSteps}>
            <Text style={styles.setupStep}>1. Gehe zu console.anthropic.com</Text>
            <Text style={styles.setupStep}>2. Erstelle einen Account und einen API-Key</Text>
            <Text style={styles.setupStep}>
              3. Öffne die Datei{' '}
              <Text style={styles.setupCode}>.env.local</Text>
              {' '}im Projektordner
            </Text>
            <Text style={styles.setupStep}>
              4. Ersetze{' '}
              <Text style={styles.setupCode}>dein_api_key_hier</Text>
              {' '}mit deinem Key
            </Text>
            <Text style={styles.setupStep}>5. Starte die App neu</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Chat-Interface ────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header-Aktionen */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {messages.length > 0
            ? `${Math.ceil(messages.length / 2)} Nachrichten`
            : 'Wie kann ich helfen?'}
        </Text>
        {messages.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn} accessibilityLabel="Gespräch löschen">
            <Ionicons name="trash-outline" size={18} color={Colors.text.secondary} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Nachrichten-Liste */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✦</Text>
              <Text style={styles.emptyTitle}>Claude AI</Text>
              <Text style={styles.emptySubtitle}>Dein Business-Assistent</Text>

              {/* Vorschläge */}
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    style={styles.suggestion}
                    onPress={() => handleSuggestion(s)}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
        />

        {/* Eingabefeld */}
        <ChatInput
          value={inputText}
          onChangeText={setInput}
          onSend={sendMessage}
          isLoading={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 14, color: Colors.text.secondary },
  clearBtn: { padding: 4 },

  listContent: { paddingVertical: 12, flexGrow: 1 },

  // Leerer Zustand
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 36, color: Colors.primary, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  emptySubtitle: { fontSize: 15, color: Colors.text.secondary, marginBottom: 32 },

  suggestions: { width: '100%', gap: 10 },
  suggestion: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background.secondary,
  },
  suggestionText: { fontSize: 14, color: Colors.text.primary, lineHeight: 20 },

  // Setup-Anleitung
  setupBox: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  setupEmoji: { fontSize: 48, textAlign: 'center' },
  setupTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, textAlign: 'center' },
  setupText: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center' },
  setupSteps: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    gap: 8,
  },
  setupStep: { fontSize: 14, color: Colors.text.primary, lineHeight: 20 },
  setupCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: Colors.border,
    color: Colors.primary,
  },
});
