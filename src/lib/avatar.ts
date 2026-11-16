import * as Device from 'expo-device';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Linking } from 'react-native';

import { errMsg, supabase } from '@/lib/supabase';

const SIZE = 320;

export type AvatarSource = 'camera' | 'library';

export type PickResult = { status: 'picked'; uri: string } | { status: 'canceled' };

export class CameraPermissionError extends Error {
  constructor(readonly canAskAgain: boolean) {
    super(canAskAgain ? 'denied' : 'blocked');
    this.name = 'CameraPermissionError';
  }
}

export class CameraUnavailableError extends Error {
  constructor() {
    super('unavailable');
    this.name = 'CameraUnavailableError';
  }
}

function nativeMissing(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  return /native module|ExpoImagePicker|not linked|Cannot find/i.test(message);
}

const pickerOptions = {
  mediaTypes: ['images'] as ['images'],
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  quality: 1,
};

/**
 * Ouvre la caméra ou la galerie comme Nudge.
 * La galerie n’appelle pas requestMediaLibraryPermissionsAsync (PHPicker).
 */
export async function pickAvatarJpeg(source: AvatarSource): Promise<PickResult> {
  if (!requireOptionalNativeModule('ExponentImagePicker')) {
    throw new Error('La photo sera disponible après la prochaine mise à jour de l’app.');
  }

  let ImagePicker: typeof import('expo-image-picker');
  let ImageManipulator: typeof import('expo-image-manipulator').ImageManipulator;
  let SaveFormat: typeof import('expo-image-manipulator').SaveFormat;
  try {
    const [picker, manipulator] = await Promise.all([import('expo-image-picker'), import('expo-image-manipulator')]);
    ImagePicker = picker;
    ImageManipulator = manipulator.ImageManipulator;
    SaveFormat = manipulator.SaveFormat;
  } catch (e) {
    if (nativeMissing(e)) throw new Error('La photo sera disponible après la prochaine mise à jour de l’app.');
    throw e;
  }

  if (source === 'camera') {
    if (!Device.isDevice) throw new CameraUnavailableError();
    try {
      const { granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) throw new CameraPermissionError(canAskAgain);
    } catch (e) {
      if (e instanceof CameraPermissionError) throw e;
      if (nativeMissing(e)) throw new Error('La photo sera disponible après la prochaine mise à jour de l’app.');
      throw e;
    }
  }

  let result;
  try {
    result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);
  } catch (e) {
    if (nativeMissing(e)) throw new Error('La photo sera disponible après la prochaine mise à jour de l’app.');
    if (source === 'camera') throw new CameraUnavailableError();
    throw e;
  }
  if (result.canceled || !result.assets[0]) return { status: 'canceled' };

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width !== asset.height) {
    const side = Math.min(asset.width, asset.height);
    context.crop({
      originX: Math.round((asset.width - side) / 2),
      originY: Math.round((asset.height - side) / 2),
      width: side,
      height: side,
    });
  }
  if (asset.width > SIZE || asset.height > SIZE) context.resize({ width: SIZE, height: SIZE });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
  return { status: 'picked', uri: saved.uri };
}

export function openAppSettings() {
  return Linking.openSettings();
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const body = await (await fetch(uri)).arrayBuffer();
  const { error } = await supabase.storage.from('avatars').upload(path, body, { contentType: 'image/jpeg' });
  if (error) throw new Error(errMsg(error));
  const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  const { error: updateError } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
  if (updateError) throw new Error(errMsg(updateError));
  const { data: files } = await supabase.storage.from('avatars').list(userId);
  const stale = (files ?? []).map((f) => `${userId}/${f.name}`).filter((name) => name !== path);
  if (stale.length) await supabase.storage.from('avatars').remove(stale);
  return url;
}

export async function removeAvatar(userId: string) {
  const { data: files } = await supabase.storage.from('avatars').list(userId);
  if (files?.length) {
    const { error: removeError } = await supabase.storage.from('avatars').remove(files.map((f) => `${userId}/${f.name}`));
    if (removeError) throw new Error(errMsg(removeError));
  }
  const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId);
  if (error) throw new Error(errMsg(error));
}
