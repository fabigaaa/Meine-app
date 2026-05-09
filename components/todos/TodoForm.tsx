import { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { TodoFormValues, TodoPriority, PROJECT_COLORS } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { ProjectBadge } from './ProjectBadge';
import { Colors } from '@/constants/Colors';

interface TodoFormProps {
  initialValues?: Partial<TodoFormValues>;
  onSubmit: (values: TodoFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const PRIORITIES: { value: TodoPriority; label: string; color: string }[] = [
  { value: 'high', label: 'Hoch', color: Colors.danger },
  { value: 'medium', label: 'Mittel', color: Colors.warning },
  { value: 'low', label: 'Niedrig', color: Colors.text.disabled },
];

export function TodoForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Speichern',
  showDeleteButton = false,
  onDelete,
}: TodoFormProps) {
  const { projects, createProject } = useTodoStore();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [priority, setPriority] = useState<TodoPriority>(initialValues?.priority ?? 'medium');
  const [projectId, setProjectId] = useState(initialValues?.projectId ?? '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Neues Projekt anlegen
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState<typeof PROJECT_COLORS[number]>(PROJECT_COLORS[0]);
  const [showNewProject, setShowNewProject] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Titel fehlt', 'Bitte gib einen Titel für diese Aufgabe ein.');
      return;
    }
    onSubmit({ title: title.trim(), description, priority, projectId, dueDate });
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    const { default: uuid } = await import('react-native-uuid');
    await createProject({
      id: uuid.v4() as string,
      name: newProjectName.trim(),
      color: newProjectColor,
      createdAt: new Date().toISOString(),
    });
    setNewProjectName('');
    setShowNewProject(false);
  };

  const handleDelete = () => {
    Alert.alert('Aufgabe löschen', `"${title}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Titel */}
      <Text style={styles.label}>Titel *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Was muss erledigt werden?"
        placeholderTextColor={Colors.text.disabled}
        autoFocus
      />

      {/* Priorität */}
      <Text style={styles.label}>Priorität</Text>
      <View style={styles.chipRow}>
        {PRIORITIES.map((p) => (
          <Pressable
            key={p.value}
            style={[
              styles.chip,
              priority === p.value && { backgroundColor: p.color + '22', borderColor: p.color },
            ]}
            onPress={() => setPriority(p.value)}
          >
            <Text style={[styles.chipText, priority === p.value && { color: p.color, fontWeight: '600' }]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Projekt */}
      <Text style={styles.label}>Projekt (optional)</Text>
      <View style={styles.chipRow}>
        <Pressable
          style={[styles.chip, projectId === '' && styles.chipActive]}
          onPress={() => setProjectId('')}
        >
          <Text style={[styles.chipText, projectId === '' && styles.chipTextActive]}>Kein Projekt</Text>
        </Pressable>
        {projects.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.chip, projectId === p.id && { borderColor: p.color }]}
            onPress={() => setProjectId(p.id)}
          >
            {projectId === p.id ? (
              <ProjectBadge project={p} small />
            ) : (
              <Text style={styles.chipText}>{p.name}</Text>
            )}
          </Pressable>
        ))}
        <Pressable style={styles.chip} onPress={() => setShowNewProject(!showNewProject)}>
          <Text style={[styles.chipText, { color: Colors.primary }]}>+ Neu</Text>
        </Pressable>
      </View>

      {/* Neues Projekt anlegen */}
      {showNewProject && (
        <View style={styles.newProjectBox}>
          <TextInput
            style={[styles.input, { marginBottom: 8 }]}
            value={newProjectName}
            onChangeText={setNewProjectName}
            placeholder="Projektname"
            placeholderTextColor={Colors.text.disabled}
          />
          <View style={styles.colorRow}>
            {PROJECT_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, newProjectColor === c && styles.colorDotActive]}
                onPress={() => setNewProjectColor(c)}
              />
            ))}
          </View>
          <Pressable style={styles.addProjectBtn} onPress={handleAddProject}>
            <Text style={styles.addProjectBtnText}>Projekt erstellen</Text>
          </Pressable>
        </View>
      )}

      {/* Fälligkeitsdatum */}
      <Text style={styles.label}>Fällig bis (optional)</Text>
      <View style={styles.dateRow}>
        <Pressable style={[styles.input, styles.dateInput]} onPress={() => setShowDatePicker(true)}>
          <Text style={dueDate ? styles.inputText : styles.inputPlaceholder}>
            {dueDate
              ? format(parseISO(dueDate), 'EEEE, d. MMMM yyyy', { locale: de })
              : 'Kein Datum'}
          </Text>
        </Pressable>
        {dueDate ? (
          <Pressable style={styles.clearBtn} onPress={() => setDueDate('')}>
            <Text style={styles.clearBtnText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Notizen */}
      <Text style={styles.label}>Notizen (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Weitere Details..."
        placeholderTextColor={Colors.text.disabled}
        multiline
        numberOfLines={3}
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
          <Text style={styles.deleteButtonText}>Aufgabe löschen</Text>
        </Pressable>
      )}

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(d) => { setDueDate(format(d, 'yyyy-MM-dd')); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background.primary },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text.secondary, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: Colors.background.primary,
  },
  inputText: { fontSize: 16, color: Colors.text.primary },
  inputPlaceholder: { fontSize: 16, color: Colors.text.disabled },
  textArea: { height: 90, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.text.secondary },
  chipTextActive: { color: Colors.text.inverse, fontWeight: '500' },
  newProjectBox: {
    marginTop: 12, padding: 12, borderRadius: 8,
    backgroundColor: Colors.background.secondary, borderWidth: 1, borderColor: Colors.border,
  },
  colorRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  colorDot: { width: 24, height: 24, borderRadius: 12 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.text.primary },
  addProjectBtn: {
    backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center',
  },
  addProjectBtnText: { color: Colors.text.inverse, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dateInput: { flex: 1 },
  clearBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  clearBtnText: { color: Colors.text.secondary, fontSize: 14 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelButton: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, color: Colors.text.secondary },
  submitButton: {
    flex: 2, paddingVertical: 14, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: Colors.text.inverse },
  deleteButton: {
    marginTop: 12, marginBottom: 40, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.danger, alignItems: 'center',
  },
  deleteButtonText: { fontSize: 16, color: Colors.danger },
});
