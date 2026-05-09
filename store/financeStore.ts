import { create } from 'zustand';
import { format } from 'date-fns';
import { Transaction, Invoice, formatCurrency } from '@/types/finance';
import {
  loadTransactions, addTransaction, updateTransaction, deleteTransaction,
  loadInvoices, addInvoice, updateInvoice, deleteInvoice,
} from '@/storage/financeStorage';

export type FinanceTab = 'overview' | 'transactions' | 'invoices';

interface FinanceState {
  transactions: Transaction[];
  invoices: Invoice[];
  activeTab: FinanceTab;
  isLoading: boolean;

  loadAll: () => Promise<void>;
  setTab: (tab: FinanceTab) => void;

  // Transaktionen
  createTransaction: (tx: Transaction) => Promise<void>;
  editTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;

  // Rechnungen
  createInvoice: (inv: Invoice) => Promise<void>;
  editInvoice: (inv: Invoice) => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
  setInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  invoices: [],
  activeTab: 'overview',
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    const [transactions, invoices] = await Promise.all([loadTransactions(), loadInvoices()]);
    set({ transactions, invoices, isLoading: false });
  },

  setTab: (tab) => set({ activeTab: tab }),

  createTransaction: async (tx) => {
    await addTransaction(tx);
    set((s) => ({ transactions: [tx, ...s.transactions] }));
  },

  editTransaction: async (tx) => {
    await updateTransaction(tx);
    set((s) => ({ transactions: s.transactions.map((t) => (t.id === tx.id ? tx : t)) }));
  },

  removeTransaction: async (id) => {
    await deleteTransaction(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  createInvoice: async (inv) => {
    await addInvoice(inv);
    set((s) => ({ invoices: [inv, ...s.invoices] }));
  },

  editInvoice: async (inv) => {
    await updateInvoice(inv);
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === inv.id ? inv : i)) }));
  },

  removeInvoice: async (id) => {
    await deleteInvoice(id);
    set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) }));
  },

  setInvoiceStatus: async (id, status) => {
    const { invoices } = get();
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    const updated = { ...inv, status, updatedAt: new Date().toISOString() };
    await updateInvoice(updated);
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? updated : i)) }));
  },
}));

// ── Selektoren ────────────────────────────────────────────

export function selectMonthSummary(transactions: Transaction[], month: string) {
  // month = "YYYY-MM"
  const inMonth = transactions.filter((t) => t.date.startsWith(month));
  const income = inMonth
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amountCents, 0);
  const expenses = inMonth
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amountCents, 0);
  return { income, expenses, balance: income - expenses };
}

// Nächste Rechnungsnummer vorschlagen
export function nextInvoiceNumber(invoices: Invoice[]): string {
  const year = new Date().getFullYear();
  const thisYear = invoices.filter((inv) => inv.number.startsWith(`${year}-`));
  const max = thisYear.reduce((n, inv) => {
    const num = parseInt(inv.number.split('-')[1] ?? '0', 10);
    return Math.max(n, num);
  }, 0);
  return `${year}-${String(max + 1).padStart(3, '0')}`;
}
