import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/types/chat';
import { Colors } from '@/constants/Colors';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {/* Avatar */}
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>✦</Text>
        </View>
      )}

      {/* Blase */}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {message.content || ' '}
        </Text>
        {/* Blinkender Cursor während Streaming */}
        {message.isStreaming && (
          <Text style={styles.cursor}>▌</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 4,
    alignItems: 'flex-end',
    gap: 8,
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 12, color: '#fff' },

  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },

  text: { fontSize: 15, lineHeight: 22 },
  textUser: { color: '#fff' },
  textAssistant: { color: Colors.text.primary },

  cursor: {
    fontSize: 16,
    color: Colors.primary,
    lineHeight: 22,
  },
});
