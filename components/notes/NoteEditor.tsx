import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, TextInput, Text, StyleSheet, Platform,
  ScrollView, KeyboardAvoidingView, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '@/types/note';
import { useNoteStore } from '@/store/noteStore';
import { Colors } from '@/constants/Colors';

interface NoteEditorProps {
  note: Note;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
}

const AUTOSAVE_DELAY_MS = 1500;

// ─── Markdown-Vorschau ────────────────────────────────────────────────

function renderInline(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|`[^`]+`)/g;
  let last = 0, key = 0;
  for (const match of line.matchAll(regex)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(<Text key={key++}>{line.slice(last, idx)}</Text>);
    const raw = match[0];
    if (raw.startsWith('**'))
      parts.push(<Text key={key++} style={{ fontWeight: '700', color: Colors.text.primary }}>{raw.slice(2, -2)}</Text>);
    else if (raw.startsWith('*'))
      parts.push(<Text key={key++} style={{ fontStyle: 'italic' }}>{raw.slice(1, -1)}</Text>);
    else if (raw.startsWith('~~'))
      parts.push(<Text key={key++} style={{ textDecorationLine: 'line-through' }}>{raw.slice(2, -2)}</Text>);
    else if (raw.startsWith('`'))
      parts.push(<Text key={key++} style={mdStyles.code}>{raw.slice(1, -1)}</Text>);
    last = idx + raw.length;
  }
  if (last < line.length) parts.push(<Text key={key++}>{line.slice(last)}</Text>);
  return parts;
}

function MarkdownPreview({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <View style={{ gap: 2 }}>
      {lines.map((line, i) => {
        if (line.startsWith('### '))
          return <Text key={i} style={mdStyles.h3}>{line.slice(4)}</Text>;
        if (line.startsWith('## '))
          return <Text key={i} style={mdStyles.h2}>{line.slice(3)}</Text>;
        if (line.startsWith('# '))
          return <Text key={i} style={mdStyles.h1}>{line.slice(2)}</Text>;
        if (line === '---')
          return <View key={i} style={mdStyles.hr} />;
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <View key={i} style={mdStyles.bulletRow}>
              <Text style={mdStyles.bullet}>•</Text>
              <Text style={mdStyles.body}>{renderInline(line.slice(2))}</Text>
            </View>
          );
        const numMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numMatch)
          return (
            <View key={i} style={mdStyles.bulletRow}>
              <Text style={mdStyles.bullet}>{numMatch[1]}.</Text>
              <Text style={mdStyles.body}>{renderInline(numMatch[2])}</Text>
            </View>
          );
        if (!line.trim())
          return <View key={i} style={{ height: 8 }} />;
        return <Text key={i} style={mdStyles.body}>{renderInline(line)}</Text>;
      })}
    </View>
  );
}

const mdStyles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, marginTop: 8, marginBottom: 4 },
  h2: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginTop: 6, marginBottom: 3 },
  h3: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginTop: 4, marginBottom: 2 },
  body: { fontSize: 15, color: Colors.text.primary, lineHeight: 24, flexShrink: 1 },
  hr: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet: { fontSize: 15, color: Colors.primary, width: 18 },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: Colors.background.secondary,
    color: Colors.primary,
    fontSize: 13,
    paddingHorizontal: 3,
    borderRadius: 3,
  },
});

// ─── Toolbar ──────────────────────────────────────────────────────────

interface FormatAction {
  key: string;
  label?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  type: 'inline' | 'prefix' | 'insert';
  syntax: string;
  suffix?: string;
}

const ACTIONS: FormatAction[] = [
  { key: 'h1',     label: 'H1',  type: 'prefix', syntax: '# ' },
  { key: 'h2',     label: 'H2',  type: 'prefix', syntax: '## ' },
  { key: 'h3',     label: 'H3',  type: 'prefix', syntax: '### ' },
  { key: 'bold',   icon: 'text', type: 'inline', syntax: '**', suffix: '**' },
  { key: 'italic', label: 'I',   type: 'inline', syntax: '*',  suffix: '*' },
  { key: 'strike', label: 'S̶',  type: 'inline', syntax: '~~', suffix: '~~' },
  { key: 'code',   icon: 'code-slash', type: 'inline', syntax: '`', suffix: '`' },
  { key: 'ul',     icon: 'list', type: 'prefix', syntax: '- ' },
  { key: 'ol',     icon: 'list-outline', type: 'prefix', syntax: '1. ' },
  { key: 'hr',     icon: 'remove-outline', type: 'insert', syntax: '\n---\n' },
];

// ─── NoteEditor ───────────────────────────────────────────────────────

export function NoteEditor({ note, onSaveStatusChange }: NoteEditorProps) {
  const { saveNote } = useNoteStore();
  const [content, setContent] = useState(note.content);
  const [preview, setPreview] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (isDirtyRef.current) saveNote({ ...note, content });
    };
  }, [content]);

  const handleChange = useCallback(
    (text: string) => {
      setContent(text);
      isDirtyRef.current = true;
      onSaveStatusChange?.('unsaved');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        onSaveStatusChange?.('saving');
        await saveNote({ ...note, content: text });
        isDirtyRef.current = false;
        onSaveStatusChange?.('saved');
      }, AUTOSAVE_DELAY_MS);
    },
    [note, saveNote, onSaveStatusChange]
  );

  const applyFormat = (action: FormatAction) => {
    const { start, end } = selection;
    const selected = content.slice(start, end);
    let newContent = content;
    let newCursor = end;

    if (action.type === 'inline') {
      const inner = selected || 'Text';
      const wrapped = `${action.syntax}${inner}${action.suffix ?? action.syntax}`;
      newContent = content.slice(0, start) + wrapped + content.slice(end);
      newCursor = start + wrapped.length;
    } else if (action.type === 'prefix') {
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      newContent = content.slice(0, lineStart) + action.syntax + content.slice(lineStart);
      newCursor = start + action.syntax.length;
    } else if (action.type === 'insert') {
      newContent = content.slice(0, start) + action.syntax + content.slice(end);
      newCursor = start + action.syntax.length;
    }

    handleChange(newContent);
    setTimeout(() => {
      inputRef.current?.setNativeProps?.({ selection: { start: newCursor, end: newCursor } });
    }, 20);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* ── Formatierungs-Toolbar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.toolbar}
        contentContainerStyle={styles.toolbarContent}
        keyboardShouldPersistTaps="always"
      >
        {ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            style={styles.tbBtn}
            onPress={() => applyFormat(action)}
          >
            {action.icon ? (
              <Ionicons name={action.icon} size={15} color={Colors.text.secondary} />
            ) : (
              <Text style={[
                styles.tbLabel,
                action.key === 'italic' && { fontStyle: 'italic' },
                action.key === 'bold' && { fontWeight: '800' },
              ]}>
                {action.label}
              </Text>
            )}
          </Pressable>
        ))}

        <View style={styles.tbSep} />

        {/* Vorschau-Toggle */}
        <Pressable
          style={[styles.tbBtn, preview && styles.tbBtnActive]}
          onPress={() => setPreview((v) => !v)}
        >
          <Ionicons
            name={preview ? 'eye' : 'eye-outline'}
            size={15}
            color={preview ? Colors.primary : Colors.text.secondary}
          />
        </Pressable>
      </ScrollView>

      {/* ── Inhalt ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {preview ? (
          <MarkdownPreview text={content || '_Leere Notiz — tippe auf das Auge zum Bearbeiten_'} />
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.editor}
            value={content}
            onChangeText={handleChange}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder={'# Überschrift\n\nText eingeben…\n\nFormate: **fett**, *kursiv*, - Liste, =SUM in Tabellen'}
            placeholderTextColor={Colors.text.disabled}
            multiline
            autoFocus={!content}
            textAlignVertical="top"
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* ── Statusleiste ── */}
      <View style={styles.statusBar}>
        <Text style={styles.hint}>{preview ? '👁 Vorschau' : '✏️ Markdown'}</Text>
        <Text style={styles.statsText}>{wordCount} Wörter · {content.length} Zeichen</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },

  toolbar: {
    maxHeight: 44,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 2,
  },
  tbBtn: {
    width: 34,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  tbBtnActive: { backgroundColor: Colors.primaryLight },
  tbLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  tbSep: { width: 1, height: 18, backgroundColor: Colors.border, marginHorizontal: 4 },

  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16 },
  editor: {
    flex: 1,
    fontSize: 15,
    lineHeight: 26,
    color: Colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 400,
  },

  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background.secondary,
  },
  hint: { fontSize: 12, color: Colors.text.disabled },
  statsText: { fontSize: 12, color: Colors.text.disabled },
});
