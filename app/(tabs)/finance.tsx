import { useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import {
  useFinanceStore, selectMonthSummary, FinanceTab,
} from '@/store/financeStore';
import { SummaryCard } from '@/components/finance/SummaryCard';
import { TransactionListItem } from '@/components/finance/TransactionListItem';
import { InvoiceListItem } from '@/components/finance/InvoiceListItem';
import { Colors } from '@/constants/Colors';

const TABS: { value: FinanceTab; label: string }[] = [
  { value: 'overview', label: 'Übersicht' },
  { value: 'transactions', label: 'Einnahmen & Ausgaben' },
  { value: 'invoices', label: 'Rechnungen' },
];

export default function FinanceScreen() {
  const { loadAll, transactions, invoices, activeTab, setTab, isLoading } = useFinanceStore();

  useEffect(() => { loadAll(); }, []);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const summary = selectMonthSummary(transactions, currentMonth);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Innere Tab-Leiste */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setTab(tab.value)}
          >
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Übersicht ── */}
      {activeTab === 'overview' && (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              <SummaryCard {...summary} month={currentMonth} />

              {/* Letzte 5 Transaktionen */}
              {transactions.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Letzte Buchungen</Text>
                    <Pressable onPress={() => setTab('transactions')}>
                      <Text style={styles.sectionLink}>Alle anzeigen</Text>
                    </Pressable>
                  </View>
                  {transactions.slice(0, 5).map((tx) => (
                    <TransactionListItem
                      key={tx.id}
                      tx={tx}
                      onPress={() => router.push(`/finance/transaction/${tx.id}`)}
                    />
                  ))}
                </>
              )}

              {/* Offene Rechnungen */}
              {invoices.filter((inv) => inv.status !== 'paid').length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Offene Rechnungen</Text>
                    <Pressable onPress={() => setTab('invoices')}>
                      <Text style={styles.sectionLink}>Alle anzeigen</Text>
                    </Pressable>
                  </View>
                  {invoices
                    .filter((inv) => inv.status !== 'paid')
                    .slice(0, 3)
                    .map((inv) => (
                      <InvoiceListItem
                        key={inv.id}
                        invoice={inv}
                        onPress={() => router.push(`/finance/invoice/${inv.id}`)}
                      />
                    ))}
                </>
              )}

              {transactions.length === 0 && invoices.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>💰</Text>
                  <Text style={styles.emptyTitle}>Noch keine Einträge</Text>
                  <Text style={styles.emptyHint}>
                    Füge Einnahmen, Ausgaben oder Rechnungen hinzu
                  </Text>
                </View>
              )}
            </>
          }
        />
      )}

      {/* ── Transaktionen ── */}
      {activeTab === 'transactions' && (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionListItem
              tx={item}
              onPress={() => router.push(`/finance/transaction/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>Noch keine Buchungen</Text>
              <Text style={styles.emptyHint}>Tippe auf + um eine Einnahme oder Ausgabe einzutragen</Text>
            </View>
          }
        />
      )}

      {/* ── Rechnungen ── */}
      {activeTab === 'invoices' && (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InvoiceListItem
              invoice={item}
              onPress={() => router.push(`/finance/invoice/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🧾</Text>
              <Text style={styles.emptyTitle}>Noch keine Rechnungen</Text>
              <Text style={styles.emptyHint}>Tippe auf + um eine Rechnung zu erstellen</Text>
            </View>
          }
        />
      )}

      {/* FAB — kontextsensitiv */}
      {activeTab !== 'overview' && (
        <Pressable
          style={styles.fab}
          onPress={() =>
            activeTab === 'transactions'
              ? router.push('/finance/new-transaction')
              : router.push('/finance/new-invoice')
          }
          accessibilityLabel={activeTab === 'transactions' ? 'Neue Buchung' : 'Neue Rechnung'}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  loader: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.text.secondary },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  sectionLink: { fontSize: 13, color: Colors.primary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.text.primary },
  emptyHint: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
});
