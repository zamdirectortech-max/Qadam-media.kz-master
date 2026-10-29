"use client";
import type { LucideIcon } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  const { t } = useLocale();
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{t(label)}</p>
        <Icon size={18} className="text-brand" />
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}
