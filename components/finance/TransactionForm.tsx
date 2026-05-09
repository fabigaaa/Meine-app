import { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  TransactionType, TransactionCategory,
  TRANSACTION_CATEGORY_LABELS, parseToCents, formatCurrency,
} from '@/types/finance';
import { Colors } from '@/constants/Colors';

export interface TransactionFormValues {
  type: TransactionType;
  amountString: string; // z.B. "1234.56"
  description: string;
  category: TransactionCategory;
  date: string;
}

interface TransactionFormProps {
  initialValues?: Partial<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const CATEGORIES = Object.entries(TRANSACTION_CATEGORY_LABELS) as [TransactionCategory, string][];

export function TransactionForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Speichern',
  showDeleteButton = false,
  onDelete,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? 'income');
  const [amount, setAmount] = useState(initialValues?.amountString ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState<TransactionCategory>(
    initialValues?.category ?? 'project'
  );
  const [date, setDate] = useState(initialValues?.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Beschreibung fehlt', 'Bitte gib eine Beschreibung ein.');
      return;
    }
    if (parseToCents(amount) === 0) {
      Alert.alert('Betrag fehlt', 'Bitte gib einen Betrag größer als 0 ein.');
      return;
    }
    onSubmit({ type, amountString: amount, description: description.trim(), category, date });
  };

  const handleDelete = () => {
    Alert.alert('Eintrag löschen', 'Diesen Eintrag wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Typ: Einnahme / Ausgabe */}
      <Text style={styles.label}>Typ</Text>
      <View style={styles.typeRow}>
        {(['income', 'expense'] as TransactionType[]).map((t) => (
          <Pressable
            key={t}
            style={[
              styles.typeBtn,
              type === t && { backgroundColor: t === 'income' ? Colors.secondary : Colors.danger },
            ]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeBtnText, type === t && { color: '#fff', fontWeight: '600' }]}>
              {t === 'income' ? '↑ Einnahme' : '↓ Ausgabe'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Betrag */}
      <Text style={styles.label}>Betrag (€)</Text>
      <TextInput
        style={[styles.input, styles.amountInput]}
        value={amount}
        onChangeText={setAmount}
        placeholder="0,00"
        placeholderTextColor={Colors.text.disabled}
        keyboardType="decimal-pad"
        autoFocus
      />

      {/* Beschreibung */}
      <Text style={styles.label}>Beschreibung</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="z.B. Logo-Design für Kunde XY"
        placeholderTextColor={Colors.text.disabled}
      />

      {/* Kategorie */}
      <Text style={styles.label}>Kategorie</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(([value, label]) => (
          <Pressable
            key={value}
            style={[styles.chip, category === value && styles.chipActive]}
            onPress={() => setCategory(value)}
          >
            <Text style={[styles.chipText, category === value && styles.chipTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Datum */}
      <Text style={styles.label}>Datum</Text>
      <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.inputText}>
          {format(new Date(date + 'T00:00:00'), 'EEEE, d. MMMM yyyy', { locale: de })}
        </Text>
      </Pressable>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Abbrechen</Text>
        </Pressable>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>
      </View>

      {showDeleteButton && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Eintrag löschen</Text>
        </Pressable>
      )}

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(d) => { setDate(format(d, 'yyyy-MM-dd')); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background.primary },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text.secondary, marginBottom: 6, marginTop: 16 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  typeBtnText: { fontSize: 15, color: Colors.text.secondary },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  amountInput: { fontSize: 24, fontWeight: '600', color: Colors.text.primary },
  inputText: { fontSize: 16, color: Colors.text.primary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text.secondary },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelButton: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: 16, color: Colors.text.secondary },
  submitButton: {
    flex: 2, paddingVertical: 14, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  deleteButton: {
    marginTop: 12, marginBottom: 40, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.danger, alignItems: 'center',
  },
  deleteText: { fontSize: 16, color: Colors.danger },
});
