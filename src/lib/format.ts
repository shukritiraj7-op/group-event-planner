import { format, parseISO } from "date-fns";

export function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function longDate(iso: string) {
  return format(parseISO(iso), "MMMM d, yyyy");
}
export function shortDate(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy");
}
export function weekday(iso: string) {
  return format(parseISO(iso), "EEEE");
}
export function monthAbbr(iso: string) {
  return format(parseISO(iso), "MMM").toUpperCase();
}
export function dayNum(iso: string) {
  return format(parseISO(iso), "dd");
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning,";
  if (h < 17) return "Good Afternoon,";
  return "Good Evening,";
}
