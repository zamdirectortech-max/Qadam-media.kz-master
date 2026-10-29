"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { localeNames, locales, messages, type Locale } from "@/lib/i18n";
type Value = { locale: Locale; setLocale: (locale: Locale) => void; t: (source: string) => string };
const LocaleContext = createContext<Value | null>(null);
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("ru");
  useEffect(() => { const saved = localStorage.getItem("qadam-locale") as Locale | null; if (saved && locales.includes(saved)) updateLocale(saved); }, []);
  const setLocale = (next: Locale) => { updateLocale(next); localStorage.setItem("qadam-locale", next); document.documentElement.lang = next; };
  const value = useMemo(() => ({ locale, setLocale, t: (source: string) => messages[locale][source] ?? source }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() { const value = useContext(LocaleContext); if (!value) throw new Error("LocaleProvider is missing"); return value; }
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) { const { locale, setLocale } = useLocale(); return <div className="language-switcher">{locales.map(item => <button key={item} onClick={() => setLocale(item)} className={locale === item ? "active" : ""} aria-pressed={locale === item}>{compact ? item.toUpperCase() : localeNames[item]}</button>)}</div>; }
