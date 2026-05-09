import { useRef, useEffect } from 'react';
import {
  View, FlatList, Text, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage, ChatAction } from '@/types/chat';
import { Colors } from '@/constants/Colors';

// Vorschläge
const SUGGESTIONS = [
  'Trag einen Kundentermin morgen um 10:00 Uhr ein',
  'Mach eine Notiz: Projekt-Ideen für den neuen Kunden',
  'Wie kalkuliere ich meinen Stundensatz als Freelancer?',
  'Schreib eine professionelle Angebotsmail',
  'Was sind die Feiertage in Österreich dieses Jahr?',
  'Erstelle ein einfaches HTML-Grundgerüst',
];

// ─── Action-Karte ─────────────────────────────────────────────────────

function ActionCard({
  action,
  messageId,
  executed,
}: {
  action: ChatAction;
  messageId: string;
  executed: boolean;
}) {
  const { executeAction, dismissAction } = useChatStore();

  if (executed) {
    return (
      <View style={[actionStyles.card, actionStyles.cardDone]}>
        <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
        <Text style={actionStyles.doneText}>
          {action.type === 'ADD_EVENT' ? '✅ Termin eingetragen' : '✅ Notiz gespeichert'}
        </Text>
      </View>
    );
  }

  if (action.type === 'ADD_EVENT') {
    return (
      <View style={actionStyles.card}>
        <View style={actionStyles.cardHeader}>
          <View style={[actionStyles.iconWrap, { backgroundColor: Colors.primary + '22' }]}>
            <Ionicons name="calendar" size={18} color={Colors.primary} />
          </View>
          <Text style={actionStyles.cardTitle}>Termin eintragen?</Text>
        </View>
        <View style={actionStyles.details}>
          <Text style={actionStyles.eventTitle}>{action.title}</Text>
          <Text style={actionStyles.eventMeta}>
            📅 {action.date}
            {action.startTime ? `  ⏰ ${action.startTime}${action.endTime ? ' – ' + action.endTime : ''}` : ''}
          </Text>
          {action.description ? (
            <Text style={actionStyles.eventDesc}>{action.description}</Text>
          ) : null}
        </View>
        <View style={actionStyles.buttons}>
          <Pressable
            style={[actionStyles.btn, actionStyles.btnConfirm]}
            onPress={() => executeAction(messageId, action)}
          >
            <Ionicons name="add-circle" size={16} color="#fff" />
            <Text style={actionStyles.btnConfirmText}>In Kalender eintragen</Text>
          </Pressable>
          <Pressable
            style={[actionStyles.btn, actionStyles.btnDismiss]}
            onPress={() => dismissAction(messageId)}
          >
            <Text style={actionStyles.btnDismissText}>Nein danke</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (action.type === 'ADD_NOTE') {
    return (
      <View style={actionStyles.card}>
        <View style={actionStyles.cardHeader}>
          <View style={[actionStyles.iconWrap, { backgroundColor: '#60A5FA22' }]}>
            <Ionicons name="document-text" size={18} color="#60A5FA" />
          </View>
          <Text style={actionStyles.cardTitle}>Als Notiz speichern?</Text>
        </View>
        <View style={actionStyles.details}>
          <Text style={actionStyles.eventTitle}>{action.title}</Text>
          <Text style={actionStyles.eventMeta} numberOfLines={3}>{action.content}</Text>
        </View>
        <View style={actionStyles.buttons}>
          <Pressable
            style={[actionStyles.btn, actionStyles.btnNote]}
            onPress={() => executeAction(messageId, action)}
          >
            <Ionicons name="save" size={16} color="#fff" />
            <Text style={actionStyles.btnConfirmText}>In Notizen speichern</Text>
          </Pressable>
          <Pressable
            style={[actionStyles.btn, actionStyles.btnDismiss]}
            onPress={() => dismissAction(messageId)}
          >
            <Text style={actionStyles.btnDismissText}>Nein danke</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

const actionStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: Colors.background.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  doneText: { fontSize: 14, color: Colors.secondary, fontWeight: '600' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  details: { gap: 4 },
  eventTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  eventMeta: { fontSize: 13, color: Colors.text.secondary },
  eventDesc: { fontSize: 13, color: Colors.text.disabled, fontStyle: 'italic' },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 2 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  btnConfirm: { backgroundColor: Colors.primary },
  btnNote: { backgroundColor: '#60A5FA' },
  btnDismiss: { backgroundColor: Colors.background.secondary, borderWidth: 1, borderColor: Colors.border },
  btnConfirmText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  btnDismissText: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary },
});

// ─── Nachricht + Action ───────────────────────────────────────────────

function MessageWithAction({ item }: { item: ChatMessage }) {
  return (
    <>
      <ChatBubble message={item} />
      {item.role === 'assistant' && item.actions && item.actions.length > 0
        ? item.actions.map((action, i) => (
            <ActionCard
              key={i}
              action={action}
              messageId={item.id}
              executed={item.actionsExecuted ?? false}
            />
          ))
        : null}
    </>
  );
}

// ─── Setup-Screen (kein Key) ─────────────────────────────────────────

function SetupScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.setupBox}>
        <Text style={styles.setupEmoji}>🤖</Text>
        <Text style={styles.setupTitle}>KI-Assistent einrichten</Text>
        <Text style={styles.setupText}>
          Dieser KI-Chat nutzt <Text style={{ color: Colors.primary, fontWeight: '700' }}>Groq</Text> —
          kostenlos, schnell und leistungsstark (Llama 3.3 70B).
        </Text>

        <View style={styles.setupSteps}>
          <Text style={styles.setupStep}>1. Gehe zu <Text style={styles.setupCode}>console.groq.com</Text></Text>
          <Text style={styles.setupStep}>2. Erstelle einen kostenlosen Account</Text>
          <Text style={styles.setupStep}>3. Klicke auf „API Keys" → „Create API Key"</Text>
          <Text style={styles.setupStep}>4. Kopiere den Key</Text>
          <Text style={styles.setupStep}>5. Öffne <Text style={styles.setupCode}>Einstellungen → KI-Assistent</Text> und trage den Key ein</Text>
        </View>

        <Pressable
          style={styles.settingsBtn}
          onPress={() => router.push('/(tabs)/settings' as any)}
        >
          <Ionicons name="settings" size={16} color="#fff" />
          <Text style={styles.settingsBtnText}>Zu den Einstellungen</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Haupt-Chat-Screen ────────────────────────────────────────────────

export default function AiChatScreen() {
  const { messages, inputText, isLoading, error, setInput, sendMessage, clearConversation } =
    useChatStore();
  const { groqApiKey } = useSettingsStore();
  const listRef = useRef<FlatList>(null);

  const hasKey = !!(groqApiKey?.trim()) || !!(process.env.EXPO_PUBLIC_GROQ_API_KEY);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  if (!hasKey) return <SetupScreen />;

  const handleClear = () => {
    if (messages.length === 0) return;
    Alert.alert('Gespräch löschen', 'Alle Nachrichten löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: clearConversation },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiDot} />
          <Text style={styles.headerTitle}>
            {messages.length > 0 ? `${Math.ceil(messages.length / 2)} Nachrichten` : 'KI-Assistent'}
          </Text>
        </View>
        {messages.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={18} color={Colors.text.secondary} />
          </Pressable>
        )}
      </View>

      {/* Fehler-Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={Colors.danger} />
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageWithAction item={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="sparkles" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Was kann ich für dich tun?</Text>
              <Text style={styles.emptySubtitle}>
                Stell mir Fragen, lass mich Termine eintragen oder Notizen erstellen.
              </Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    style={({ pressed }) => [styles.suggestion, pressed && { opacity: 0.7 }]}
                    onPress={() => setInput(s)}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.text.disabled} />
                  </Pressable>
                ))}
              </View>
            </View>
          }
        />

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

// ─── Styles ───────────────────────────────────────────────────────────

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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  headerTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary },
  clearBtn: { padding: 4 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.danger + '22',
    borderBottomWidth: 1,
    borderBottomColor: Colors.danger + '44',
  },
  errorText: { flex: 1, fontSize: 12, color: Colors.danger },

  listContent: { paddingVertical: 12, flexGrow: 1 },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },

  suggestions: { width: '100%', gap: 8 },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background.card,
  },
  suggestionText: { flex: 1, fontSize: 14, color: Colors.text.primary, lineHeight: 20 },

  // Setup
  setupBox: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 },
  setupEmoji: { fontSize: 52, textAlign: 'center' },
  setupTitle: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, textAlign: 'center' },
  setupText: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  setupSteps: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  setupStep: { fontSize: 14, color: Colors.text.primary, lineHeight: 22 },
  setupCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.primary,
    fontWeight: '700',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  settingsBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
