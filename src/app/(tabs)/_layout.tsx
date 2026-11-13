import { Link, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, View, type ColorValue } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { symbol } from '@/lib/symbols';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

function tabIcon(ios: string, android: string) {
  const name = symbol(ios, android);
  function TabIcon({ color }: { color: ColorValue }) {
    return <SymbolView name={name} tintColor={color} size={26} />;
  }
  return TabIcon;
}

function ProfileButton() {
  const box = useActiveBox();
  return (
    <View style={{ marginHorizontal: 16 }}>
      <Link href="/profil" asChild>
        <Pressable accessibilityLabel="Mon profil" hitSlop={8}>
          <Avatar name={box.my_display_name} size={32} />
        </Pressable>
      </Link>
    </View>
  );
}

export default function TabLayout() {
  const box = useActiveBox();
  const c = useBrand();

  return (
    <Tabs
      screenOptions={{
        headerTitle: box.name,
        headerStyle: { backgroundColor: c.primary },
        headerTintColor: c.onPrimary,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        headerRight: () => <ProfileButton />,
        tabBarStyle: { backgroundColor: c.primary, borderTopColor: c.primary },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.onPrimaryMuted,
        tabBarLabelStyle: { fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Aujourd’hui', headerShown: false, tabBarIcon: tabIcon('calendar', 'today') }}
      />
      <Tabs.Screen name="actus" options={{ title: 'Actus', tabBarIcon: tabIcon('megaphone.fill', 'campaign') }} />
      <Tabs.Screen name="chrono" options={{ title: 'Chrono', tabBarIcon: tabIcon('stopwatch.fill', 'timer') }} />
      <Tabs.Screen name="records" options={{ title: 'PR', tabBarIcon: tabIcon('trophy.fill', 'emoji_events') }} />
    </Tabs>
  );
}
