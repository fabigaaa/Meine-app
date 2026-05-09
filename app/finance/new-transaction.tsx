import { router } from 'expo-router';
import uuid from 'react-native-uuid';
import { TransactionForm, TransactionFormValues } from '@/components/finance/TransactionForm';
import { useFinanceStore } from '@/store/financeStore';
import { Transaction, parseToCents } from '@/types/finance';

export default function NewTransactionScreen() {
  const { createTransaction } = useFinanceStore();

  const handleSubmit = async (values: TransactionFormValues) => {
    const now = new Date().toISOString();
    const tx: Transaction = {
      id: uuid.v4() as string,
      type: values.type,
      amountCents: parseToCents(values.amountString),
      description: values.description,
      category: values.category,
      date: values.date,
      createdAt: now,
      updatedAt: now,
    };
    await createTransaction(tx);
    router.back();
  };

  return (
    <TransactionForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="Buchung speichern"
    />
  );
}
