"use client";
import { PageHeading } from "@/components/page-heading";
import { mediaAssets } from "@/lib/data";
import { Search, Upload } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function LibraryPage() {
  const {t}=useLocale();
  return (
    <>
      <PageHeading eyebrow="Media Library" title="Photos, videos, documents and AI-generated assets" text="Upload, search, tag, filter, organize folders and preview campaign media." />
      <div className="panel p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-2 border border-line px-4 py-3" style={{ borderRadius: 8 }}>
            <Search size={18} />
            <input className="w-full outline-none" placeholder={t("Search media")} />
          </label>
          <button className="primary-button"><Upload size={18} /> {t("Upload")}</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {mediaAssets.map((asset) => (
            <div className="border border-line p-4" style={{ borderRadius: 8 }} key={asset.name}>
              <div className="grid h-32 place-items-center bg-cloud" style={{ borderRadius: 8 }}>
                <asset.icon className="text-brand" />
              </div>
              <p className="mt-4 font-semibold">{asset.name}</p>
              <p className="text-sm text-slate-500">{asset.type} / {asset.tag}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
