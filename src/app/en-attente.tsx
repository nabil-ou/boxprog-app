import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BrandScreen } from '@/components/BrandScreen';
import { Button } from '@/components/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useBox, useBrand, type Access } from '@/providers/BoxProvider';

const COPY: Partial<Record<Access, { title: string; body: string; retry?: string }>> = {
  pending: {
    title: 'Demande envoyée',
    body: 'Ton inscription doit être validée par l’équipe de la box. Tu auras accès à l’app dès que c’est fait.',
    retry: 'Vérifier à nouveau',
  },
  blocked: {
    title: 'Accès suspendu',
    body: 'La box a suspendu ton accès. Rapproche-toi de l’équipe pour en savoir plus.',
  },
  unavailable: {
    title: 'Box indisponible',
    body: 'L’app de la box est momentanément fermée. Réessaie plus tard ou contacte l’équipe.',
    retry: 'Réessayer',
  },
  error: {
    title: 'Connexion impossible',
    body: 'Impossible de joindre la box pour le moment. Vérifie ton réseau puis réessaie.',
    retry: 'Réessayer',
  },
};

export default function WaitingScreen() {
  const { access, reload } = useBox();
  const { signOut } = useAuth();
  const c = useBrand();
  const [busy, setBusy] = useState(false);
  const copy = COPY[access] ?? COPY.error!;

  const retry = async () => {
    setBusy(true);
    await reload();
    setBusy(false);
  };

  return (
    <BrandScreen title={copy.title}>
      <Text style={[styles.body, { color: c.muted }]}>{copy.body}</Text>
      {copy.retry ? <Button label={copy.retry} onPress={retry} busy={busy} /> : null}
      <Button label="Se déconnecter" variant="ghost" onPress={signOut} />
    </BrandScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 23,
  },
});
