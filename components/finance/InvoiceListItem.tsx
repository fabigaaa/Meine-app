import { View, Text, Pressable, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Invoice, formatCurrency, invoiceTotal,
  INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS,
} from '@/types/finance';
import { Colors } from '@/constants/Colors';

interface InvoiceListItemProps {
  invoice: Invoice;
  onPress: () => void;
}

export function InvoiceListItem({ invoice, onPress }: InvoiceListItemProps) {
  const total = invoiceTotal(invoice);
  const statusColor = INVOICE_STATUS_COLORS[invoice.status];

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.number}>{invoice.number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.client} numberOfLines={1}>{invoice.clientName}</Text>
        <Text style={styles.date}>
          Fällig: {format(parseISO(invoice.dueDate), 'd. MMM yyyy', { locale: de })}
        </Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(total)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  pressed: { backgroundColor: Colors.background.secondary },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  number: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  client: { fontSize: 15, color: Colors.text.primary },
  date: { fontSize: 12, color: Colors.text.secondary },
  amount: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
});
