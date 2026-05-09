import { useLocalSearchParams, router } from 'expo-router';
import { TransactionForm, TransactionFormValues } from '@/components/finance/TransactionForm';
import { useFinanceStore } from '@/store/financeStore';
import { parseToCents } from '@/types/finance';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, editTransaction, removeTransaction } = useFinanceStore();

  const tx = transactions.find((t) => t.id === id);
  if (!tx) { router.back(); return null; }

  const handleSubmit = async (values: TransactionFormValues) => {
    await editTransaction({
      ...tx,
      type: values.type,
      amountCents: parseToCents(values.amountString),
      description: values.description,
      category: values.category,
      date: values.date,
      updatedAt: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <TransactionForm
      initialValues={{
        type: tx.type,
        amountString: String(tx.amountCents / 100),
        description: tx.description,
        category: tx.category,
        date: tx.date,
      }}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Änderungen speichern"
      showDeleteButton
      onDelete={async () => { await removeTransaction(tx.id); router.back(); }}
    />
  );
}
