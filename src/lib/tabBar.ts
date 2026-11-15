import type { Palette } from '@/lib/theme';

export const TAB_BAR_CONTENT = 52;

export function tabBarStyle(c: Palette, bottomInset: number) {
  return {
    backgroundColor: c.primary,
    borderTopWidth: 0,
    height: TAB_BAR_CONTENT + bottomInset,
    paddingTop: 0,
    paddingBottom: bottomInset,
  };
}
