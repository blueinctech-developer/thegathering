import {
  Bed,
  Buildings,
  Chair,
  Flame,
  Globe,
  HandHeart,
  Handshake,
  HandsPraying,
  Heart,
  Lightbulb,
  MapPin,
  Megaphone,
  MusicNotes,
  Plant,
  ShieldCheck,
  Stethoscope,
  Sun,
  Users,
  Wall,
  Bank,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";

const MAP: Record<string, ComponentType<IconProps>> = {
  flame: Flame,
  heart: Heart,
  users: Users,
  stethoscope: Stethoscope,
  bowl: HandHeart,
  plant: Plant,
  sun: Sun,
  wall: Wall,
  lightbulb: Lightbulb,
  music: MusicNotes,
  chair: Chair,
  bed: Bed,
  shield: ShieldCheck,
  bank: Bank,
  buildings: Buildings,
  handshake: Handshake,
  hands: HandsPraying,
  globe: Globe,
  megaphone: Megaphone,
  map: MapPin,
};

/** Renders a list item's chosen icon (names are stored by the admin). */
export function ListIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const Cmp = MAP[name];
  if (!Cmp) return null;
  return <Cmp size={size} weight="light" className={className} aria-hidden />;
}
