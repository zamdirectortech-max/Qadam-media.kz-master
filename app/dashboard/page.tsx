"use client";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { todayStats } from "@/lib/data";
import { Bot, FileText, Image, Lightbulb, Video } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

const creation = [
  { label: "Text", icon: FileText },
  { label: "Photo", icon: Image },
  { label: "Video", icon: Video },
  { label: "AI Generate", icon: Bot },
  { label: "News / Idea", icon: Lightbulb },
];

export default function DashboardPage() {
  const { t } = useLocale();
  return (
    <>
      <PageHeading eyebrow="Today" title="AI command center for your content" text="Plan publications, review drafts and manage every client workspace from one screen." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {todayStats.map((stat) => <MetricCard key={stat.label} {...stat} />)}
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">{t("Create new content")}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {creation.map((item) => (
              <button key={item.label} className="flex min-h-28 flex-col items-start justify-between border border-line bg-white p-4 text-left transition hover:border-ink" style={{ borderRadius: 8 }}>
                <item.icon size={22} className="text-brand" />
                <span className="text-sm font-semibold">{t(item.label)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">{t("Client workspaces")}</h2>
          <div className="mt-5 space-y-3">
            {["Client A", "Client B", "Client C", "Client D"].map((client, index) => (
              <div key={client} className="flex items-center justify-between border border-line p-3" style={{ borderRadius: 8 }}>
                <span className="font-medium">{client}</span>
                <span className="text-sm text-slate-500">{12 + index * 4} {t("posts")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
