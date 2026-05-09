import { View, Text, Pressable, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Transaction, formatCurrency, TRANSACTION_CATEGORY_LABELS } from '@/types/finance';
import { Colors } from '@/constants/Colors';

interface TransactionListItemProps {
  tx: Transaction;
  onPress: () => void;
}

export function TransactionListItem({ tx, onPress }: TransactionListItemProps) {
  const isIncome = tx.type === 'income';
  const amountColor = isIncome ? Colors.secondary : Colors.danger;
  const sign = isIncome ? '+' : '−';

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Kategorie-Icon-Box */}
      <View style={[styles.iconBox, { backgroundColor: amountColor + '18' }]}>
        <Text style={styles.icon}>{isIncome ? '↑' : '↓'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={1}>{tx.description}</Text>
        <Text style={styles.meta}>
          {TRANSACTION_CATEGORY_LABELS[tx.category]} ·{' '}
          {format(parseISO(tx.date), 'd. MMM yyyy', { locale: de })}
        </Text>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>
        {sign} {formatCurrency(tx.amountCents)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  pressed: { backgroundColor: Colors.background.secondary },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, gap: 3 },
  description: { fontSize: 15, color: Colors.text.primary },
  meta: { fontSize: 12, color: Colors.text.secondary },
  amount: { fontSize: 15, fontWeight: '600' },
});
