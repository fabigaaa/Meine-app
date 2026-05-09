import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore, AppSettings } from '@/store/settingsStore';
import { Colors } from '@/constants/Colors';

// ─── Hilfskomponenten ────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function Row({
  label,
  children,
  onPress,
  danger = false,
}: {
  label: string;
  children?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const inner = (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={onPress}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

function ToggleRow({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabelCol}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: Colors.primary, false: Colors.border }}
        thumbColor={Colors.background.primary}
      />
    </View>
  );
}

function ChipSelector<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <Pressable
          key={String(opt.value)}
          style={[styles.chip, value === opt.value && styles.chipActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Farbauswahl ──────────────────────────────────────────────────────

const ACCENT_COLORS = [
  { color: '#4F46E5', label: 'Indigo' },
  { color: '#0EA5E9', label: 'Blau' },
  { color: '#10B981', label: 'Grün' },
  { color: '#F59E0B', label: 'Orange' },
  { color: '#EF4444', label: 'Rot' },
  { color: '#8B5CF6', label: 'Violett' },
  { color: '#EC4899', label: 'Pink' },
  { color: '#14B8A6', label: 'Türkis' },
];

// ─── Hauptscreen ──────────────────────────────────────────────────────

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const { load, update, resetAll } = settings;

  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setApiKeyInput(settings.anthropicApiKey);
  }, [settings.isLoaded]);

  const handleUpdate = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    update(key, value);
  };

  const handleApiKeySave = () => {
    handleUpdate('anthropicApiKey', apiKeyInput.trim());
    Alert.alert('Gespeichert', 'API-Schlüssel wurde gespeichert.');
  };

  const handleExport = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
      const data: Record<string, unknown> = {};
      entries.forEach(([k, v]) => {
        if (v) data[k] = JSON.parse(v);
      });
      const json = JSON.stringify(data, null, 2);
      await Share.share({ message: json, title: 'App-Daten Export' });
    } catch {
      Alert.alert('Fehler', 'Export fehlgeschlagen.');
    }
  };

  const handleResetAll = () => {
    Alert.alert(
      'Alle Daten löschen?',
      'Kalender, Aufgaben, Notizen und alle Einstellungen werden unwiderruflich gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alles löschen',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            await resetAll();
            Alert.alert('Erledigt', 'Alle Daten wurden gelöscht.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── AUSSEHEN ─────────────────────────────────────── */}
        <SectionHeader title="AUSSEHEN" />
        <SettingsCard>
          <Row label="Akzentfarbe">
            <View style={styles.colorRow}>
              {ACCENT_COLORS.map(({ color }) => (
                <Pressable
                  key={color}
                  onPress={() => handleUpdate('accentColor', color)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    settings.accentColor === color && styles.colorCircleSelected,
                  ]}
                >
                  {settings.accentColor === color && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>
          </Row>
          <Divider />
          <Row label="Schriftgröße">
            <ChipSelector
              options={[
                { value: 'small' as const, label: 'Klein' },
                { value: 'medium' as const, label: 'Mittel' },
                { value: 'large' as const, label: 'Groß' },
              ]}
              value={settings.fontSize}
              onChange={(v) => handleUpdate('fontSize', v)}
            />
          </Row>
        </SettingsCard>

        {/* ── KALENDER ─────────────────────────────────────── */}
        <SectionHeader title="KALENDER" />
        <SettingsCard>
          <Row label="Wochenbeginn">
            <ChipSelector
              options={[
                { value: 1 as const, label: 'Montag' },
                { value: 0 as const, label: 'Sonntag' },
              ]}
              value={settings.weekStartsOn}
              onChange={(v) => handleUpdate('weekStartsOn', v)}
            />
          </Row>
          <Divider />
          <Row label="Standard-Termindauer">
            <ChipSelector
              options={[
                { value: 30, label: '30 Min' },
                { value: 60, label: '1 Std' },
                { value: 90, label: '1,5 Std' },
                { value: 120, label: '2 Std' },
              ]}
              value={settings.defaultEventDuration}
              onChange={(v) => handleUpdate('defaultEventDuration', v)}
            />
          </Row>
          <Divider />
          <Row label="Erinnerung">
            <ChipSelector
              options={[
                { value: 0, label: 'Keine' },
                { value: 15, label: '15 Min' },
                { value: 30, label: '30 Min' },
                { value: 60, label: '1 Std' },
              ]}
              value={settings.defaultReminderMinutes}
              onChange={(v) => handleUpdate('defaultReminderMinutes', v)}
            />
          </Row>
        </SettingsCard>

        {/* ── AUFGABEN ─────────────────────────────────────── */}
        <SectionHeader title="AUFGABEN" />
        <SettingsCard>
          <ToggleRow
            label="Erledigte ausblenden"
            sublabel="Abgehakte Aufgaben nicht anzeigen"
            value={settings.hideCompletedTodos}
            onChange={(v) => handleUpdate('hideCompletedTodos', v)}
          />
        </SettingsCard>

        {/* ── BENACHRICHTIGUNGEN ───────────────────────────── */}
        <SectionHeader title="BENACHRICHTIGUNGEN" />
        <SettingsCard>
          <ToggleRow
            label="Terminerinnerungen"
            sublabel="Push-Notification vor Terminen"
            value={settings.notificationsEnabled}
            onChange={(v) => handleUpdate('notificationsEnabled', v)}
          />
          <Divider />
          <ToggleRow
            label="Tägliche Zusammenfassung"
            sublabel="Jeden Morgen um 8:00 Uhr"
            value={settings.dailySummaryEnabled}
            onChange={(v) => handleUpdate('dailySummaryEnabled', v)}
          />
        </SettingsCard>

        {/* ── KI-ASSISTENT ─────────────────────────────────── */}
        <SectionHeader title="KI-ASSISTENT" />
        <SettingsCard>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>API-Schlüssel</Text>
          </View>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-api03-..."
              placeholderTextColor={Colors.text.disabled}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setShowApiKey(!showApiKey)} style={styles.eyeBtn}>
              <Ionicons
                name={showApiKey ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.text.secondary}
              />
            </Pressable>
          </View>
          <Pressable style={styles.saveKeyBtn} onPress={handleApiKeySave}>
            <Text style={styles.saveKeyText}>Schlüssel speichern</Text>
          </Pressable>
          <View style={styles.apiKeyHint}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.text.disabled} />
            <Text style={styles.apiKeyHintText}>
              Schlüssel werden lokal gespeichert und niemals übertragen. Erhältlich auf console.anthropic.com
            </Text>
          </View>
          <Divider />
          <Row label="KI-Modell" />
          <View style={styles.modelRow}>
            {[
              { value: 'claude-haiku-4-5-20251001', label: 'Haiku', desc: 'Schnell & günstig' },
              { value: 'claude-sonnet-4-6', label: 'Sonnet', desc: 'Ausgewogen' },
              { value: 'claude-opus-4-7', label: 'Opus', desc: 'Leistungsstark' },
            ].map((m) => (
              <Pressable
                key={m.value}
                style={[styles.modelCard, settings.aiModel === m.value && styles.modelCardActive]}
                onPress={() => handleUpdate('aiModel', m.value)}
              >
                <Text style={[styles.modelLabel, settings.aiModel === m.value && styles.modelLabelActive]}>
                  {m.label}
                </Text>
                <Text style={styles.modelDesc}>{m.desc}</Text>
              </Pressable>
            ))}
          </View>
        </SettingsCard>

        {/* ── DATEN ────────────────────────────────────────── */}
        <SectionHeader title="DATEN & PRIVATSPHÄRE" />
        <SettingsCard>
          <Row
            label="Alle Daten exportieren"
            onPress={handleExport}
          >
            <Ionicons name="share-outline" size={18} color={Colors.text.secondary} />
          </Row>
          <Divider />
          <Row
            label="Alle Daten löschen"
            onPress={handleResetAll}
            danger
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </Row>
        </SettingsCard>

        {/* ── ÜBER DIE APP ─────────────────────────────────── */}
        <SectionHeader title="ÜBER DIESE APP" />
        <SettingsCard>
          <Row label="Version">
            <Text style={styles.valueText}>1.0.0</Text>
          </Row>
          <Divider />
          <Row label="Technologie">
            <Text style={styles.valueText}>Expo · React Native</Text>
          </Row>
          <Divider />
          <Row label="KI-Engine">
            <Text style={styles.valueText}>Anthropic Claude</Text>
          </Row>
          <Divider />
          <Row
            label="Feedback senden"
            onPress={() =>
              Alert.alert(
                'Feedback',
                'Öffne GitHub Issues oder sende eine E-Mail an den Entwickler.',
                [{ text: 'OK' }]
              )
            }
          >
            <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
          </Row>
        </SettingsCard>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  scroll: { paddingVertical: 8 },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    letterSpacing: 0.6,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },

  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginLeft: 16 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 48,
  },
  rowLabelCol: { flex: 1, paddingRight: 8 },
  rowLabel: { fontSize: 15, color: Colors.text.primary },
  sublabel: { fontSize: 12, color: Colors.text.disabled, marginTop: 2 },
  rowRight: { flexShrink: 0 },
  dangerText: { color: Colors.danger },
  valueText: { fontSize: 14, color: Colors.text.secondary },
  pressed: { opacity: 0.6 },

  // Color picker
  colorRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2.5,
    borderColor: Colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background.secondary,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text.secondary },
  chipTextActive: { color: Colors.text.inverse, fontWeight: '600' },

  // API Key
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 10,
  },
  apiKeyInput: { flex: 1, fontSize: 14, color: Colors.text.primary, paddingVertical: 10 },
  eyeBtn: { padding: 6 },
  saveKeyBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveKeyText: { color: Colors.text.inverse, fontSize: 14, fontWeight: '600' },
  apiKeyHint: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  apiKeyHintText: { flex: 1, fontSize: 12, color: Colors.text.disabled, lineHeight: 17 },

  // Model cards
  modelRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  modelCard: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  modelCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  modelLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary },
  modelLabelActive: { color: Colors.primary },
  modelDesc: { fontSize: 11, color: Colors.text.disabled, marginTop: 2, textAlign: 'center' },
});
