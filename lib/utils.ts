import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return "bg-destructive"
  if (percentage >= 75) return "bg-warning"
  return "bg-primary"
}

export function getProgressTrackColor(percentage: number): string {
  if (percentage >= 90) return "bg-destructive/20"
  if (percentage >= 75) return "bg-warning/20"
  return "bg-primary/20"
}
