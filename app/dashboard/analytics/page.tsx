import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { BarChart3, Eye, Heart, MessageCircle, MousePointerClick, Share } from "lucide-react";

const metrics = [
  { label: "Reach", value: "184K", icon: Eye },
  { label: "Engagement", value: "8.4%", icon: Heart },
  { label: "Comments", value: "1,284", icon: MessageCircle },
  { label: "Shares", value: "3,920", icon: Share },
  { label: "Clicks", value: "12.8K", icon: MousePointerClick },
];

export default function AnalyticsPage() {
  return (
    <>
      <PageHeading eyebrow="Analytics" title="Performance insights and AI recommendations" text="Track reach, engagement, followers growth, best platforms, best posting time and post-level performance." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">Engagement over time</h2>
          <div className="mt-6 flex h-72 items-end gap-3">
            {[38, 54, 42, 71, 64, 88, 79, 96, 82, 104, 92, 118].map((height, index) => (
              <div key={index} className="flex-1 bg-brand" style={{ height, borderRadius: 8 }} />
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-brand" />
            <h2 className="text-xl font-semibold">AI Analytics Assistant</h2>
          </div>
          <p className="mt-4 leading-7 text-slate-600">Лучше всего работают публикации с коротким видео-хуком, локальным контекстом и явным CTA. Следующий тест: Telegram + Instagram Reels в 18:30.</p>
        </div>
      </section>
    </>
  );
}
