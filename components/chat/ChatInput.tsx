import { View, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChangeText, onSend, isLoading }: ChatInputProps) {
  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Nachricht schreiben…"
        placeholderTextColor={Colors.text.disabled}
        multiline
        maxLength={4000}
        onSubmitEditing={Platform.OS === 'web' ? onSend : undefined}
        blurOnSubmit={false}
      />
      <Pressable
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!canSend}
        accessibilityLabel="Senden"
      >
        <Ionicons
          name={isLoading ? 'ellipsis-horizontal' : 'arrow-up'}
          size={20}
          color={canSend ? '#fff' : Colors.text.disabled}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background.primary,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: Colors.border },
});
