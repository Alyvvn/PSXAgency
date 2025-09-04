import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}
