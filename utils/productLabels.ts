import type { ProductCategory } from "../types/product";

export function categoryLabel(category: ProductCategory) {
  switch (category) {
    case "entry-gaming":
      return "Entry Gaming";
    case "esports":
      return "Esports";
    case "aaa":
      return "AAA";
    case "creator-gaming":
      return "Creator + Gaming";
    case "thin-gaming":
      return "Tipis & Powerful";
  }
}

export function categoryBadgeClass(category: ProductCategory) {
  switch (category) {
    case "entry-gaming":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "esports":
      return "bg-sky-100 text-sky-800 ring-sky-200";
    case "aaa":
      return "bg-violet-100 text-violet-800 ring-violet-200";
    case "creator-gaming":
      return "bg-amber-100 text-amber-900 ring-amber-200";
    case "thin-gaming":
      return "bg-rose-100 text-rose-800 ring-rose-200";
  }
}

export function stockBadgeClass(stock: number) {
  if (stock <= 0) return "bg-red-100 text-red-800 ring-red-200";
  if (stock <= 3) return "bg-amber-100 text-amber-900 ring-amber-200";
  return "bg-slate-100 text-slate-800 ring-slate-200";
}

export function truncate(text: string, max = 90) {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3).trimEnd()}...`;
}

