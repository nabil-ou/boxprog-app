import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, type ColorValue } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size ?? 24} />;
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
        options={{ title: 'WOD', headerShown: false, tabBarIcon: tabIcon('barbell') }}
      />
      <Tabs.Screen name="actus" options={{ title: 'Actus', tabBarIcon: tabIcon('megaphone') }} />
      <Tabs.Screen name="chrono" options={{ title: 'Chrono', tabBarIcon: tabIcon('stopwatch') }} />
      <Tabs.Screen name="records" options={{ title: 'PR', tabBarIcon: tabIcon('ribbon') }} />
    </Tabs>
  );
}
