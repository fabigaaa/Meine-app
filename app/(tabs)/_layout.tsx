import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

// Logo: Lege deine Bilddatei unter assets/logo.png ab, um sie hier anzuzeigen.
// Solange die Datei nicht existiert, wird der orange "M"-Platzhalter gezeigt.
const LOGO_SOURCE = (() => {
  try { return require('@/assets/logo.png'); } catch { return null; }
})();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  shortTitle: string;
  icon: IoniconName;
  iconFocused: IoniconName;
  href: string;
}

const TABS: TabConfig[] = [
  { name: 'index',       title: 'Home',          shortTitle: 'Home',      icon: 'home-outline',                iconFocused: 'home',                 href: '/(tabs)' },
  { name: 'calendar',    title: 'Kalender',      shortTitle: 'Kalender',  icon: 'calendar-outline',            iconFocused: 'calendar',             href: '/(tabs)/calendar' },
  { name: 'todos',       title: 'To-Do',         shortTitle: 'To-Do',     icon: 'checkbox-outline',            iconFocused: 'checkbox',             href: '/(tabs)/todos' },
  { name: 'notes',       title: 'Notizen',       shortTitle: 'Notizen',   icon: 'document-text-outline',       iconFocused: 'document-text',        href: '/(tabs)/notes' },
  { name: 'spreadsheet', title: 'Tabellen',      shortTitle: 'Tabellen',  icon: 'grid-outline',                iconFocused: 'grid',                 href: '/(tabs)/spreadsheet' },
  { name: 'finance',     title: 'Finanzen',      shortTitle: 'Finanzen',  icon: 'wallet-outline',              iconFocused: 'wallet',               href: '/(tabs)/finance' },
  { name: 'ai-chat',     title: 'KI-Chat',       shortTitle: 'KI-Chat',   icon: 'chatbubble-ellipses-outline', iconFocused: 'chatbubble-ellipses',  href: '/(tabs)/ai-chat' },
  { name: 'settings',    title: 'Einstellungen', shortTitle: 'Einst.',    icon: 'settings-outline',            iconFocused: 'settings',             href: '/(tabs)/settings' },
];

export const TAB_BAR_WIDTH = 64;

// ─── Seitenleiste ────────────────────────────────────────────────────

function Sidebar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  // Aktiven Tab aus dem aktuellen Pfad ableiten
  const activeTabName = useMemo(() => {
    if (pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index') return 'index';
    const match = TABS.find(
      (t) => t.name !== 'index' && pathname.startsWith(`/(tabs)/${t.name}`)
    );
    return match?.name ?? 'index';
  }, [pathname]);

  return (
    <View
      style={[
        styles.sidebar,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 },
      ]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        {LOGO_SOURCE ? (
          <Image source={LOGO_SOURCE} style={styles.logoImage} />
        ) : (
          <Text style={styles.logoText}>M</Text>
        )}
      </View>

      {/* Tab-Einträge */}
      <View style={styles.tabList}>
        {TABS.map((tab) => {
          const focused = activeTabName === tab.name;
          const color = focused ? Colors.primary : Colors.text.secondary;

          return (
            <Pressable
              key={tab.name}
              onPress={() => router.navigate(tab.href as Parameters<typeof router.navigate>[0])}
              style={({ pressed }) => [
                styles.tabItem,
                focused && styles.tabItemActive,
                pressed && !focused && styles.tabItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.title}
            >
              {/* Aktiv-Indikator */}
              <View style={[styles.activeBar, focused && styles.activeBarVisible]} />

              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={22}
                color={color}
              />
              <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                {tab.shortTitle}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.versionText}>v1.0</Text>
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <View style={styles.root}>
      {/* Seitenleiste links — nimmt keinen Platz vom Inhalt */}
      <Sidebar />

      {/* Inhalt rechts — füllt den restlichen Platz vollständig */}
      <View style={styles.content}>
        <Tabs
          tabBar={() => null}
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background.primary },
            headerTintColor: Colors.text.primary,
            headerShadowVisible: false,
          }}
        >
          {TABS.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{ title: tab.title }}
            />
          ))}
        </Tabs>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Hauptcontainer: Leiste links, Inhalt rechts — kein Überlappen möglich
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },

  // Seitenleiste
  sidebar: {
    width: TAB_BAR_WIDTH,
    backgroundColor: Colors.background.primary,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    flexDirection: 'column',
    alignItems: 'center',
  },

  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.inverse,
  },
  logoImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  tabList: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    gap: 2,
  },

  tabItem: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabItemPressed: {
    backgroundColor: Colors.background.secondary,
  },

  activeBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
  },
  activeBarVisible: {
    backgroundColor: Colors.primary,
  },

  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  versionText: {
    fontSize: 9,
    color: Colors.text.disabled,
    marginTop: 4,
  },
});
