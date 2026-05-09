import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="calendar/new-event"
          options={{ title: 'Neuer Termin', presentation: 'modal' }}
        />
        <Stack.Screen
          name="calendar/[id]"
          options={{ title: 'Termin bearbeiten', presentation: 'modal' }}
        />
        <Stack.Screen
          name="todos/new-todo"
          options={{ title: 'Neue Aufgabe', presentation: 'modal' }}
        />
        <Stack.Screen
          name="todos/[id]"
          options={{ title: 'Aufgabe bearbeiten', presentation: 'modal' }}
        />
        <Stack.Screen
          name="notes/[id]"
          options={{ title: '' }}
        />
        <Stack.Screen
          name="finance/new-transaction"
          options={{ title: 'Neue Buchung', presentation: 'modal' }}
        />
        <Stack.Screen
          name="finance/transaction/[id]"
          options={{ title: 'Buchung bearbeiten', presentation: 'modal' }}
        />
        <Stack.Screen
          name="finance/new-invoice"
          options={{ title: 'Neue Rechnung', presentation: 'modal' }}
        />
        <Stack.Screen
          name="finance/invoice/[id]"
          options={{ title: 'Rechnung bearbeiten', presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
