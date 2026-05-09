import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatCurrency } from '@/types/finance';
import { Colors } from '@/constants/Colors';

interface SummaryCardProps {
  income: number;
  expenses: number;
  balance: number;
  month: string; // "YYYY-MM"
}

export function SummaryCard({ income, expenses, balance, month }: SummaryCardProps) {
  const monthLabel = format(new Date(month + '-01'), 'MMMM yyyy', { locale: de });
  const isPositive = balance >= 0;
  const total = income + expenses;
  const incomePercent = total > 0 ? (income / total) * 100 : 50;

  return (
    <View style={styles.card}>
      <Text style={styles.monthLabel}>{monthLabel}</Text>

      {/* Saldo */}
      <Text style={[styles.balance, { color: isPositive ? Colors.secondary : Colors.danger }]}>
        {isPositive ? '+' : ''}{formatCurrency(balance)}
      </Text>
      <Text style={styles.balanceLabel}>Saldo</Text>

      {/* Balken */}
      <View style={styles.bar}>
        <View style={[styles.barIncome, { flex: incomePercent }]} />
        <View style={[styles.barExpense, { flex: 100 - incomePercent }]} />
      </View>

      {/* Einnahmen / Ausgaben */}
      <View style={styles.row}>
        <View style={styles.col}>
          <View style={styles.dot} />
          <Text style={styles.colLabel}>Einnahmen</Text>
          <Text style={[styles.colAmount, { color: Colors.secondary }]}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={styles.col}>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.colLabel}>Ausgaben</Text>
          <Text style={[styles.colAmount, { color: Colors.danger }]}>
            {formatCurrency(expenses)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  monthLabel: { fontSize: 13, color: Colors.text.secondary, textTransform: 'capitalize' },
  balance: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  balanceLabel: { fontSize: 13, color: Colors.text.secondary, marginTop: -4 },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
    backgroundColor: Colors.border,
  },
  barIncome: { backgroundColor: Colors.secondary },
  barExpense: { backgroundColor: Colors.danger },
  row: { flexDirection: 'row', gap: 16, marginTop: 4 },
  col: { flex: 1, gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  colLabel: { fontSize: 12, color: Colors.text.secondary },
  colAmount: { fontSize: 16, fontWeight: '600' },
});
