import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent, EventCategory, EventFormValues, RecurrenceType } from '@/types/calendar';
import { Colors } from '@/constants/Colors';

interface EventFormProps {
  initialValues?: Partial<CalendarEvent>;
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'personal', label: 'Persönlich' },
  { value: 'other', label: 'Sonstiges' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Nicht' },
  { value: 'daily', label: 'Täglich' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'monthly', label: 'Monatlich' },
  { value: 'yearly', label: 'Jährlich' },
];

export function EventForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Speichern',
  showDeleteButton = false,
  onDelete,
}: EventFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [category, setCategory] = useState<EventCategory>(initialValues?.category ?? 'meeting');
  const [isAllDay, setIsAllDay] = useState(initialValues?.isAllDay ?? false);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [date, setDate] = useState(initialValues?.date ?? format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '');
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? '10:00');
  const [recurrence, setRecurrence] = useState<RecurrenceType>(initialValues?.recurrence ?? 'none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initialValues?.recurrenceEndDate ?? '');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showRecEndDatePicker, setShowRecEndDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Titel fehlt', 'Bitte gib einen Titel für diesen Termin ein.');
      return;
    }
    onSubmit({
      title: title.trim(),
      date,
      endDate,
      startTime,
      endTime,
      category,
      description,
      isAllDay,
      recurrence,
      recurrenceEndDate,
    });
  };

  const handleDelete = () => {
    Alert.alert('Termin löschen', `"${title}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: onDelete },
    ]);
  };

  const formatDateDisplay = (d: string) =>
    format(new Date(d + 'T00:00:00'), 'EEEE, d. MMMM yyyy', { locale: de });

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Titel */}
      <Text style={styles.label}>Titel *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Titel des Termins"
        placeholderTextColor={Colors.text.disabled}
        autoFocus
      />

      {/* Startdatum */}
      <Text style={styles.label}>Startdatum</Text>
      <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.inputText}>{formatDateDisplay(date)}</Text>
      </Pressable>

      {/* Enddatum (mehrtägig) */}
      <Text style={styles.label}>Enddatum (mehrtägig)</Text>
      <Pressable
        style={[styles.input, styles.row]}
        onPress={() => endDate ? setShowEndDatePicker(true) : setShowEndDatePicker(true)}
      >
        <Text style={[styles.inputText, !endDate && styles.placeholder]}>
          {endDate ? formatDateDisplay(endDate) : 'Kein Enddatum'}
        </Text>
        {endDate && (
          <Pressable onPress={() => setEndDate('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
        {!endDate && (
          <Pressable onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.addBtn}>+ Hinzufügen</Text>
          </Pressable>
        )}
      </Pressable>

      {/* Ganztägig */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Ganztägig</Text>
        <Switch
          value={isAllDay}
          onValueChange={setIsAllDay}
          trackColor={{ true: Colors.primary, false: Colors.border }}
        />
      </View>

      {/* Uhrzeit */}
      {!isAllDay && (
        <>
          <Text style={styles.label}>Startzeit</Text>
          <Pressable style={styles.input} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.inputText}>{startTime} Uhr</Text>
          </Pressable>
          <Text style={styles.label}>Endzeit</Text>
          <Pressable style={styles.input} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.inputText}>{endTime} Uhr</Text>
          </Pressable>
        </>
      )}

      {/* Kategorie */}
      <Text style={styles.label}>Kategorie</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.value}
            style={[styles.chip, category === cat.value && styles.chipActive]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Wiederholung */}
      <Text style={styles.label}>Wiederholung</Text>
      <View style={styles.chipRow}>
        {RECURRENCE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.chip, recurrence === opt.value && styles.chipActive]}
            onPress={() => setRecurrence(opt.value)}
          >
            <Text style={[styles.chipText, recurrence === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Wiederholung bis */}
      {recurrence !== 'none' && (
        <>
          <Text style={styles.label}>Wiederholung bis</Text>
          <Pressable
            style={[styles.input, styles.row]}
            onPress={() => setShowRecEndDatePicker(true)}
          >
            <Text style={[styles.inputText, !recurrenceEndDate && styles.placeholder]}>
              {recurrenceEndDate ? formatDateDisplay(recurrenceEndDate) : 'Kein Enddatum'}
            </Text>
            {recurrenceEndDate && (
              <Pressable onPress={() => setRecurrenceEndDate('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            )}
          </Pressable>
        </>
      )}

      {/* Notizen */}
      <Text style={styles.label}>Notizen (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Notizen hinzufügen..."
        placeholderTextColor={Colors.text.disabled}
        multiline
        numberOfLines={4}
      />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Abbrechen</Text>
        </Pressable>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        </Pressable>
      </View>

      {showDeleteButton && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Termin löschen</Text>
        </Pressable>
      )}

      {/* Date Pickers */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(d) => { setDate(format(d, 'yyyy-MM-dd')); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
      <DateTimePickerModal
        isVisible={showEndDatePicker}
        mode="date"
        onConfirm={(d) => { setEndDate(format(d, 'yyyy-MM-dd')); setShowEndDatePicker(false); }}
        onCancel={() => setShowEndDatePicker(false)}
      />
      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="time"
        onConfirm={(d) => { setStartTime(format(d, 'HH:mm')); setShowStartPicker(false); }}
        onCancel={() => setShowStartPicker(false)}
      />
      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="time"
        onConfirm={(d) => { setEndTime(format(d, 'HH:mm')); setShowEndPicker(false); }}
        onCancel={() => setShowEndPicker(false)}
      />
      <DateTimePickerModal
        isVisible={showRecEndDatePicker}
        mode="date"
        onConfirm={(d) => { setRecurrenceEndDate(format(d, 'yyyy-MM-dd')); setShowRecEndDatePicker(false); }}
        onCancel={() => setShowRecEndDatePicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background.primary },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputText: { fontSize: 16, color: Colors.text.primary },
  placeholder: { color: Colors.text.disabled },
  textArea: { height: 100, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.text.secondary },
  chipTextActive: { color: Colors.text.inverse, fontWeight: '500' },
  clearBtn: { fontSize: 14, color: Colors.text.secondary, paddingHorizontal: 4 },
  addBtn: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, color: Colors.text.secondary },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: Colors.text.inverse },
  deleteButton: {
    marginTop: 12,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.danger,
    alignItems: 'center',
  },
  deleteButtonText: { fontSize: 16, color: Colors.danger },
});
