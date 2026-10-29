"use client";
import { PageHeading } from "@/components/page-heading";
import { variants } from "@/lib/data";
import { Send } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function AssistantPage() {
  const {t}=useLocale();
  return (
    <>
      <PageHeading eyebrow="AI Assistant" title="Generate adapted content, not duplicated copy" text="The assistant uses Brand Kit, target audience and platform presets to create channel-specific versions." />
      <section className="panel p-6">
        <textarea className="min-h-32 w-full border border-line p-4 outline-none focus:border-ink" style={{ borderRadius: 8 }} defaultValue="Мы открыли новый филиал в Шымкенте. Первые 3 дня скидка 20%." />
        <button className="primary-button mt-4"><Send size={18} /> {t("Generate")}</button>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        {variants.map((variant) => (
          <article className="panel p-5" key={variant.platform}>
            <p className="muted-label">{variant.platform}</p>
            <h2 className="mt-2 font-semibold">{variant.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{variant.text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
