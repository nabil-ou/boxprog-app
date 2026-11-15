import type { LucideIcon, LucideProps } from 'lucide-react-native';

/** Stroke Lucide unique pour toute l’app. */
export const APP_ICON_STROKE = 1.5;

export function AppIcon({
  icon: Icon,
  size = 22,
  color,
  strokeWidth = APP_ICON_STROKE,
  ...rest
}: {
  icon: LucideIcon;
  size?: number;
  color: string;
  strokeWidth?: number;
} & Omit<LucideProps, 'size' | 'color' | 'strokeWidth'>) {
  return <Icon size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
