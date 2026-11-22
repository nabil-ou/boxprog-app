import { Tabs } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { Dumbbell, House, Medal, Users } from 'lucide-react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { useReminderSync } from '@/hooks/useReminderSync';
import { TAB_BAR_CONTENT, tabBarStyle } from '@/lib/tabBar';
import { FontSize, FontWeight, font } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';
import { RecordsProvider } from '@/providers/RecordsProvider';

function tabIcon(Icon: LucideIcon) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Icon color={color} size={size ?? 22} strokeWidth={APP_ICON_STROKE} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  useReminderSync(box.training_days, box.name);

  return (
    <RecordsProvider>
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
            title: 'Home',
            headerShown: false,
            tabBarIcon: tabIcon(House),
          }}
        />
        <Tabs.Screen
          name="wod"
          options={{
            title: 'WOD',
            headerShown: false,
            tabBarIcon: tabIcon(Dumbbell),
          }}
        />
        <Tabs.Screen
          name="communaute"
          options={{
            title: 'Communauté',
            headerShown: false,
            tabBarIcon: tabIcon(Users),
          }}
        />
        <Tabs.Screen
          name="records"
          options={{
            title: 'PR',
            headerShown: false,
            tabBarIcon: tabIcon(Medal),
          }}
        />
        <Tabs.Screen name="chrono" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="profil" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="reserver" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="planning" options={{ href: null, headerShown: false }} />
      </Tabs>
    </RecordsProvider>
  );
}
