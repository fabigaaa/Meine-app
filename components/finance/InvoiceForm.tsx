import { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Invoice, InvoiceItem, InvoiceStatus, formatCurrency, parseToCents } from '@/types/finance';
import { Colors } from '@/constants/Colors';

interface InvoiceFormProps {
  initialValues?: Partial<Invoice>;
  invoiceNumber: string;
  onSubmit: (values: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitLabel?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'sent', label: 'Versendet' },
  { value: 'paid', label: 'Bezahlt' },
  { value: 'overdue', label: 'Überfällig' },
];

export function InvoiceForm({
  initialValues,
  invoiceNumber,
  onSubmit,
  onCancel,
  submitLabel = 'Speichern',
  showDeleteButton = false,
  onDelete,
}: InvoiceFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultDue = format(addDays(new Date(), 14), 'yyyy-MM-dd');

  const [number, setNumber] = useState(initialValues?.number ?? invoiceNumber);
  const [clientName, setClientName] = useState(initialValues?.clientName ?? '');
  const [clientEmail, setClientEmail] = useState(initialValues?.clientEmail ?? '');
  const [issueDate, setIssueDate] = useState(initialValues?.issueDate ?? today);
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? defaultDue);
  const [taxRate, setTaxRate] = useState(String(initialValues?.taxRate ?? 19));
  const [status, setStatus] = useState<InvoiceStatus>(initialValues?.status ?? 'draft');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [items, setItems] = useState<InvoiceItem[]>(
    initialValues?.items ?? [{ description: '', quantity: 1, unitPriceCents: 0 }]
  );

  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPriceCents: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const netTotal = items.reduce((s, item) => s + item.quantity * item.unitPriceCents, 0);
  const tax = Math.round(netTotal * parseInt(taxRate || '0', 10) / 100);
  const gross = netTotal + tax;

  const handleSubmit = () => {
    if (!clientName.trim()) {
      Alert.alert('Kundenname fehlt', 'Bitte gib den Namen des Kunden ein.');
      return;
    }
    if (items.every((item) => item.unitPriceCents === 0)) {
      Alert.alert('Kein Betrag', 'Bitte gib mindestens eine Position mit einem Preis ein.');
      return;
    }
    onSubmit({
      number: number.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || undefined,
      items,
      taxRate: parseInt(taxRate || '0', 10),
      issueDate,
      dueDate,
      status,
      notes: notes.trim() || undefined,
    });
  };

  const handleDelete = () => {
    Alert.alert('Rechnung löschen', 'Diese Rechnung wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Rechnungsnummer & Status */}
      <Text style={styles.label}>Rechnungsnummer</Text>
      <TextInput style={styles.input} value={number} onChangeText={setNumber} />

      <Text style={styles.label}>Status</Text>
      <View style={styles.chipRow}>
        {STATUS_OPTIONS.map((s) => (
          <Pressable
            key={s.value}
            style={[styles.chip, status === s.value && styles.chipActive]}
            onPress={() => setStatus(s.value)}
          >
            <Text style={[styles.chipText, status === s.value && styles.chipTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Kunde */}
      <Text style={styles.label}>Kundenname *</Text>
      <TextInput
        style={styles.input}
        value={clientName}
        onChangeText={setClientName}
        placeholder="Max Mustermann GmbH"
        placeholderTextColor={Colors.text.disabled}
        autoFocus
      />

      <Text style={styles.label}>Kunden-E-Mail (optional)</Text>
      <TextInput
        style={styles.input}
        value={clientEmail}
        onChangeText={setClientEmail}
        placeholder="kunde@example.com"
        placeholderTextColor={Colors.text.disabled}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Datum */}
      <Text style={styles.label}>Rechnungsdatum</Text>
      <Pressable style={styles.input} onPress={() => setShowIssuePicker(true)}>
        <Text style={styles.inputText}>
          {format(new Date(issueDate + 'T00:00:00'), 'd. MMMM yyyy', { locale: de })}
        </Text>
      </Pressable>

      <Text style={styles.label}>Fälligkeitsdatum</Text>
      <Pressable style={styles.input} onPress={() => setShowDuePicker(true)}>
        <Text style={styles.inputText}>
          {format(new Date(dueDate + 'T00:00:00'), 'd. MMMM yyyy', { locale: de })}
        </Text>
      </Pressable>

      {/* Positionen */}
      <Text style={styles.label}>Positionen</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <TextInput
            style={[styles.input, styles.itemDesc]}
            value={item.description}
            onChangeText={(v) => updateItem(index, 'description', v)}
            placeholder="Beschreibung"
            placeholderTextColor={Colors.text.disabled}
          />
          <TextInput
            style={[styles.input, styles.itemQty]}
            value={String(item.quantity)}
            onChangeText={(v) => updateItem(index, 'quantity', parseInt(v || '1', 10))}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={Colors.text.disabled}
          />
          <TextInput
            style={[styles.input, styles.itemPrice]}
            value={item.unitPriceCents > 0 ? String(item.unitPriceCents / 100) : ''}
            onChangeText={(v) => updateItem(index, 'unitPriceCents', parseToCents(v))}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={Colors.text.disabled}
          />
          {items.length > 1 && (
            <Pressable onPress={() => removeItem(index)} style={styles.removeItemBtn}>
              <Text style={styles.removeItemText}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Pressable style={styles.addItemBtn} onPress={addItem}>
        <Text style={styles.addItemText}>+ Position hinzufügen</Text>
      </Pressable>

      {/* Steuer & Summe */}
      <Text style={styles.label}>Mehrwertsteuer (%)</Text>
      <TextInput
        style={styles.input}
        value={taxRate}
        onChangeText={setTaxRate}
        keyboardType="number-pad"
        placeholder="19"
        placeholderTextColor={Colors.text.disabled}
      />

      <View style={styles.totalBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Netto</Text>
          <Text style={styles.totalValue}>{formatCurrency(netTotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>MwSt. ({taxRate}%)</Text>
          <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
        </View>
        <View style={[styles.totalRow, styles.totalGrossRow]}>
          <Text style={styles.totalGrossLabel}>Gesamt</Text>
          <Text style={styles.totalGrossValue}>{formatCurrency(gross)}</Text>
        </View>
      </View>

      {/* Notizen */}
      <Text style={styles.label}>Notizen / Zahlungshinweis (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Zahlbar innerhalb von 14 Tagen ohne Abzug..."
        placeholderTextColor={Colors.text.disabled}
        multiline
        numberOfLines={3}
      />

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
          <Text style={styles.deleteText}>Rechnung löschen</Text>
        </Pressable>
      )}

      <DateTimePickerModal
        isVisible={showIssuePicker}
        mode="date"
        onConfirm={(d) => { setIssueDate(format(d, 'yyyy-MM-dd')); setShowIssuePicker(false); }}
        onCancel={() => setShowIssuePicker(false)}
      />
      <DateTimePickerModal
        isVisible={showDuePicker}
        mode="date"
        onConfirm={(d) => { setDueDate(format(d, 'yyyy-MM-dd')); setShowDuePicker(false); }}
        onCancel={() => setShowDuePicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background.primary },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text.secondary, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: Colors.text.primary,
  },
  inputText: { fontSize: 15, color: Colors.text.primary },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text.secondary },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  itemRow: { flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'center' },
  itemDesc: { flex: 3 },
  itemQty: { flex: 1, textAlign: 'center' },
  itemPrice: { flex: 2, textAlign: 'right' },
  removeItemBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  removeItemText: { fontSize: 12, color: Colors.text.secondary },
  addItemBtn: {
    paddingVertical: 10, borderRadius: 8, borderWidth: 1,
    borderColor: Colors.primary, borderStyle: 'dashed', alignItems: 'center', marginTop: 4,
  },
  addItemText: { fontSize: 14, color: Colors.primary },
  totalBox: {
    marginTop: 12, padding: 12, borderRadius: 8,
    backgroundColor: Colors.background.secondary, gap: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, color: Colors.text.secondary },
  totalValue: { fontSize: 14, color: Colors.text.primary },
  totalGrossRow: {
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, marginTop: 4,
  },
  totalGrossLabel: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  totalGrossValue: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
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
