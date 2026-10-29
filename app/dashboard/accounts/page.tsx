"use client";
import { PageHeading } from "@/components/page-heading";
import { platforms } from "@/lib/data";
import { Link2, RefreshCw, Unplug } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function AccountsPage() {
  const {t}=useLocale();
  return (
    <>
      <PageHeading eyebrow="Connected accounts" title="OAuth-based social account layer" text="QADAM MEDIA never stores social passwords. Unsupported connectors stay transparent with integration status." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform, index) => {
          const connected = index < 2;
          return (
            <article className="panel p-5" key={platform}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{platform}</h2>
                <span className={connected ? "text-sm font-medium text-teal-700" : "text-sm font-medium text-slate-500"}>
                  {t(connected ? "Connected" : "Integration coming soon")}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="secondary-button px-3 py-2"><Link2 size={16} /> {t("Connect")}</button>
                <button className="secondary-button px-3 py-2"><RefreshCw size={16} /> {t("Reconnect")}</button>
                <button className="secondary-button px-3 py-2"><Unplug size={16} /> {t("Disconnect")}</button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
