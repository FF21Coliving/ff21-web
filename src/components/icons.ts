import {
  Armchair,
  BedDouble,
  BedSingle,
  Building2,
  CalendarClock,
  Clock,
  DoorOpen,
  Footprints,
  Gamepad2,
  KeyRound,
  Laptop,
  MapPin,
  PartyPopper,
  PenLine,
  PlugZap,
  ReceiptIndianRupee,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  Sunset,
  Users,
  UtensilsCrossed,
  Wallet,
  WashingMachine,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { AmenityIcon } from "@/lib/content";
import type { RoomKind } from "@/lib/properties";

// What one monthly rent covers, as the FAQ states it: the furnished room,
// meals, WiFi, housekeeping, laundry, utilities and the common spaces, with
// taxes and charges included.
export const included: { label: string; icon: LucideIcon }[] = [
  { label: "Furnished room", icon: BedDouble },
  { label: "Meals", icon: UtensilsCrossed },
  { label: "WiFi", icon: Wifi },
  { label: "Housekeeping", icon: Sparkles },
  { label: "Laundry", icon: WashingMachine },
  { label: "Utilities", icon: PlugZap },
  { label: "Common spaces", icon: Armchair },
  { label: "Taxes and charges", icon: ReceiptIndianRupee },
];

// The four people notice first, for small spaces like cards.
export const includedShort = included.filter((i) => ["Meals", "WiFi", "Housekeeping", "Laundry"].includes(i.label));

export const roomIcons: Record<RoomKind, LucideIcon> = {
  twin: Users,
  private: KeyRound,
  studio: DoorOpen,
};

// One icon per home, matching its highlight.
export const highlightIcons: Record<string, LucideIcon> = {
  "itp-whitefield": Building2,
  "wfd-whitefield": Footprints,
  "kdh-kundanahalli": Sunset,
  "pods-marathahalli": BedSingle,
  "lit-thubarahalli": Sprout,
  "bgm-doddanekundi": Building2,
  "pmc-mahadevapura": Sunset,
  "hbr-hennur": Building2,
  "kora-koramangala": DoorOpen,
  "sjr-sarjapur": MapPin,
};

export const amenityIcons: Record<AmenityIcon, LucideIcon> = {
  meals: UtensilsCrossed,
  wifi: Wifi,
  housekeeping: Sparkles,
  work: Laptop,
  play: Gamepad2,
  security: ShieldCheck,
  community: PartyPopper,
  app: Smartphone,
};

// Things to know, by label.
export const termIcons: Record<string, LucideIcon> = {
  "Booking amount": Wallet,
  Deposit: ShieldCheck,
  "Minimum stay": CalendarClock,
  "Notice to vacate": Clock,
  "Move-out charge": ReceiptIndianRupee,
  Refunds: RotateCcw,
};

export const stepIcons: LucideIcon[] = [MapPin, Wallet, PenLine, KeyRound];
