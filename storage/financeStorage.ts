import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Invoice } from '@/types/finance';

const TX_KEY = 'finance_transactions';
const INV_KEY = 'finance_invoices';

// ── Transaktionen ─────────────────────────────────────────

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const json = await AsyncStorage.getItem(TX_KEY);
    return json ? (JSON.parse(json) as Transaction[]) : [];
  } catch { return []; }
}

async function saveTransactions(items: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(TX_KEY, JSON.stringify(items));
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const items = await loadTransactions();
  items.unshift(tx);
  await saveTransactions(items);
}

export async function updateTransaction(updated: Transaction): Promise<void> {
  const items = await loadTransactions();
  const i = items.findIndex((t) => t.id === updated.id);
  if (i !== -1) items[i] = updated;
  await saveTransactions(items);
}

export async function deleteTransaction(id: string): Promise<void> {
  const items = await loadTransactions();
  await saveTransactions(items.filter((t) => t.id !== id));
}

// ── Rechnungen ────────────────────────────────────────────

export async function loadInvoices(): Promise<Invoice[]> {
  try {
    const json = await AsyncStorage.getItem(INV_KEY);
    return json ? (JSON.parse(json) as Invoice[]) : [];
  } catch { return []; }
}

async function saveInvoices(invoices: Invoice[]): Promise<void> {
  await AsyncStorage.setItem(INV_KEY, JSON.stringify(invoices));
}

export async function addInvoice(inv: Invoice): Promise<void> {
  const invoices = await loadInvoices();
  invoices.unshift(inv);
  await saveInvoices(invoices);
}

export async function updateInvoice(updated: Invoice): Promise<void> {
  const invoices = await loadInvoices();
  const i = invoices.findIndex((inv) => inv.id === updated.id);
  if (i !== -1) invoices[i] = updated;
  await saveInvoices(invoices);
}

export async function deleteInvoice(id: string): Promise<void> {
  const invoices = await loadInvoices();
  await saveInvoices(invoices.filter((inv) => inv.id !== id));
}
