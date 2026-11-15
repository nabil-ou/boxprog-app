import type { LucideIcon, LucideProps } from "lucide-react-native";

/** Lucide stroke icons — 1.5 matches the Chrono maquette. */
export const CHRONO_ICON_STROKE = 2;

export function ChronoIcon({
  icon: Icon,
  size = 22,
  color,
  strokeWidth = CHRONO_ICON_STROKE,
  ...rest
}: {
  icon: LucideIcon;
  size?: number;
  color: string;
  strokeWidth?: number;
} & Omit<LucideProps, "size" | "color" | "strokeWidth">) {
  return <Icon size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
