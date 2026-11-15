import { Link, Tabs } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { Dumbbell, Medal, Megaphone, Timer } from 'lucide-react-native';
import { Pressable, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { Avatar } from '@/components/Avatar';
import { TAB_BAR_CONTENT, tabBarStyle } from '@/lib/tabBar';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

function tabIcon(Icon: LucideIcon) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Icon color={color} size={size ?? 22} strokeWidth={APP_ICON_STROKE} />;
  }
  return TabIcon;
}

function ProfileButton() {
  const box = useActiveBox();
  return (
    <View style={{ marginHorizontal: Spacing.M }}>
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
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerTitle: box.name,
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerTitleStyle: {
          fontFamily: font.semibold,
          fontWeight: FontWeight.SEMI_BOLD,
          fontSize: FontSize.L,
        },
        headerShadowVisible: false,
        headerRight: () => <ProfileButton />,
        tabBarStyle: tabBarStyle(c, insets.bottom),
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          height: TAB_BAR_CONTENT,
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: {
          fontFamily: font.medium,
          fontWeight: FontWeight.MEDIUM,
          fontSize: FontSize.XXS + 1,
          marginTop: 2,
          marginBottom: 0,
          lineHeight: 14,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'WOD',
          headerShown: false,
          tabBarIcon: tabIcon(Dumbbell),
        }}
      />
      <Tabs.Screen
        name="actus"
        options={{
          title: 'Actus',
          headerShown: false,
          tabBarIcon: tabIcon(Megaphone),
        }}
      />
      <Tabs.Screen
        name="chrono"
        options={{ title: 'Chrono', headerShown: false, tabBarIcon: tabIcon(Timer) }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'PR',
          headerShown: false,
          tabBarIcon: tabIcon(Medal),
        }}
      />
    </Tabs>
  );
}
