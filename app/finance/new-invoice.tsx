import { router } from 'expo-router';
import uuid from 'react-native-uuid';
import { InvoiceForm } from '@/components/finance/InvoiceForm';
import { useFinanceStore, nextInvoiceNumber } from '@/store/financeStore';
import { Invoice } from '@/types/finance';

export default function NewInvoiceScreen() {
  const { createInvoice, invoices } = useFinanceStore();
  const invoiceNumber = nextInvoiceNumber(invoices);

  const handleSubmit = async (values: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    await createInvoice({ id: uuid.v4() as string, ...values, createdAt: now, updatedAt: now });
    router.back();
  };

  return (
    <InvoiceForm
      invoiceNumber={invoiceNumber}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Rechnung erstellen"
    />
  );
}
