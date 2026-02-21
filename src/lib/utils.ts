import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter } from "date-fns";
import { bs } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "dd.MM.yyyy") {
  return format(new Date(date), fmt, { locale: bs });
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: bs });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("bs-BA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " KM";
}

export function isOverdue(date: string | Date) {
  return isAfter(new Date(), new Date(date));
}

export function truncate(str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}

export const SECTION_STATUS_CONFIG = {
  pending: { label: "Čeka", color: "text-text-dim", bg: "bg-bg-tertiary", icon: "⬜" },
  generating: { label: "Generišem", color: "text-brand", bg: "bg-brand/10", icon: "🔄" },
  awaiting_approval: { label: "Na odobrenju", color: "text-warning", bg: "bg-warning/10", icon: "⏳" },
  approved: { label: "Odobreno", color: "text-success", bg: "bg-success/10", icon: "✅" },
  revision_requested: { label: "Izmjena", color: "text-orange-400", bg: "bg-orange-400/10", icon: "✏️" },
} as const;

export const PROJECT_STATUS_CONFIG = {
  draft: { label: "Nacrt", color: "#94a3b8" },
  in_progress: { label: "U toku", color: "#0ea5e9" },
  review: { label: "Na pregledu", color: "#f59e0b" },
  completed: { label: "Završeno", color: "#10b981" },
  archived: { label: "Arhivirano", color: "#6b7280" },
} as const;
