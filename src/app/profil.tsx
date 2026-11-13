import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FormError } from '@/components/FormError';
import { Screen } from '@/components/Screen';
import { errMsg, supabase } from '@/lib/supabase';
import { LEVELS, ROLE_LABEL, type Level } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveBox, useBox, useBrand } from '@/providers/BoxProvider';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { reload } = useBox();
  const box = useActiveBox();
  const c = useBrand();
  const [level, setLevel] = useState<Level>(box.my_level ?? 'RX');
  const [error, setError] = useState<string | null>(null);

  const chooseLevel = async (l: Level) => {
    if (!session || l === level) return;
    const previous = level;
    setLevel(l);
    setError(null);
    const { error } = await supabase
      .from('memberships')
      .update({ default_level: l })
      .eq('box_id', box.id)
      .eq('user_id', session.user.id);
    if (error) {
      setLevel(previous);
      setError(errMsg(error));
    } else {
      reload();
    }
  };

  return (
    <Screen>
      <View style={[styles.card, styles.identity, { backgroundColor: c.surface }]}>
        <Avatar name={box.my_display_name} size={72} />
        <Text style={[styles.name, { color: c.text }]}>{box.my_display_name}</Text>
        <Text style={{ color: c.muted }}>{session?.user.email}</Text>
        <Text style={[styles.role, { color: c.ink }]}>
          {box.my_role ? ROLE_LABEL[box.my_role] : ''} · {box.name}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: c.surface }]}>
        <Text style={[styles.section, { color: c.text }]}>Niveau par défaut</Text>
        <Text style={{ color: c.muted, lineHeight: 20 }}>La séance du jour s’ouvrira à ce niveau.</Text>
        <View style={styles.levels} accessibilityRole="radiogroup">
          {LEVELS.map((l) => {
            const on = l === level;
            return (
              <Pressable
                key={l}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => chooseLevel(l)}
                style={[styles.level, { borderColor: on ? c.ink : c.border, backgroundColor: on ? c.ink : c.surface }]}>
                <Text style={{ color: on ? '#FFFFFF' : c.text, fontWeight: '700' }}>{l}</Text>
              </Pressable>
            );
          })}
        </View>
        <FormError message={error} />
      </View>

      <Button label="Se déconnecter" variant="ghost" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  identity: {
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
  },
  levels: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  level: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
