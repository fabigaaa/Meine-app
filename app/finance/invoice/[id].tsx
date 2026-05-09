import { useLocalSearchParams, router } from 'expo-router';
import { InvoiceForm } from '@/components/finance/InvoiceForm';
import { useFinanceStore } from '@/store/financeStore';
import { Invoice } from '@/types/finance';

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, editInvoice, removeInvoice } = useFinanceStore();

  const inv = invoices.find((i) => i.id === id);
  if (!inv) { router.back(); return null; }

  const handleSubmit = async (values: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    await editInvoice({ ...inv, ...values, updatedAt: new Date().toISOString() });
    router.back();
  };

  return (
    <InvoiceForm
      initialValues={inv}
      invoiceNumber={inv.number}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Änderungen speichern"
      showDeleteButton
      onDelete={async () => { await removeInvoice(inv.id); router.back(); }}
    />
  );
}
