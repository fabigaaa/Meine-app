// ── Transaktionen ─────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'project'       // Projekteinnahme
  | 'subscription'  // Software-Abo (z.B. Adobe)
  | 'equipment'     // Hardware / Equipment
  | 'office'        // Büro / Arbeitsmittel
  | 'travel'        // Reisekosten
  | 'tax'           // Steuern / Gebühren
  | 'other';        // Sonstiges

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number;    // Betrag in Cent — verhindert Kommazahl-Probleme
  description: string;
  category: TransactionCategory;
  date: string;           // "YYYY-MM-DD"
  invoiceId?: string;     // Verknüpfte Rechnung (optional)
  createdAt: string;
  updatedAt: string;
}

// ── Rechnungen ────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPriceCents: number; // Stückpreis in Cent
}

export interface Invoice {
  id: string;
  number: string;         // z.B. "2024-001"
  clientName: string;
  clientEmail?: string;
  items: InvoiceItem[];
  taxRate: number;        // z.B. 19 für 19%
  issueDate: string;      // "YYYY-MM-DD"
  dueDate: string;        // "YYYY-MM-DD"
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Hilfsfunktionen ───────────────────────────────────────

// Cent → "1.234,56 €" (deutsches Format)
export function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return amount.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}

// String → Cent (z.B. "1234.56" → 123456)
export function parseToCents(value: string): number {
  const cleaned = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const float = parseFloat(cleaned);
  if (isNaN(float)) return 0;
  return Math.round(float * 100);
}

export function invoiceTotal(invoice: Invoice): number {
  const net = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0
  );
  return net + Math.round(net * invoice.taxRate / 100);
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Entwurf',
  sent: 'Versendet',
  paid: 'Bezahlt',
  overdue: 'Überfällig',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: '#6B7280',
  sent: '#4F46E5',
  paid: '#10B981',
  overdue: '#EF4444',
};

export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
  project: 'Projekt',
  subscription: 'Abonnement',
  equipment: 'Equipment',
  office: 'Büro',
  travel: 'Reise',
  tax: 'Steuern',
  other: 'Sonstiges',
};
