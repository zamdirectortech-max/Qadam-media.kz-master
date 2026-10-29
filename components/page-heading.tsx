"use client";
import { useLocale } from "@/components/locale-provider";
export function PageHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  const { t } = useLocale();
  return (
    <div className="mb-7 max-w-3xl">
      <p className="muted-label">{t(eyebrow)}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink md:text-4xl">{t(title)}</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">{t(text)}</p>
    </div>
  );
}
