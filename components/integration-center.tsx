"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clipboard, ExternalLink, FlaskConical, Link2, Settings2, Unplug } from "lucide-react";
import { integrations, type Integration } from "@/lib/integrations";
import { useLocale } from "@/components/locale-provider";

const statusStyle: Record<string, string> = {
  CONNECTED: "bg-emerald-50 text-emerald-700", NOT_CONNECTED: "bg-slate-100 text-slate-600",
  RATE_LIMIT: "bg-amber-50 text-amber-700", CONFIGURATION_ERROR: "bg-rose-50 text-rose-700",
};

function PlatformCard({ item, admin }: { item: Integration; admin: boolean }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(item.code === "tiktok" && admin);
  const copy = async () => { await navigator.clipboard.writeText(item.redirectUri); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return <article className="panel overflow-hidden">
    <div className="p-5">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{item.name}</h2><p className="mt-1 text-xs text-slate-500">API {item.apiVersion} · {t(item.oauth ? "OAuth required" : "OAuth not required")}</p></div><span className={`px-2.5 py-1 text-xs font-semibold ${statusStyle[item.status] ?? "bg-rose-50 text-rose-700"}`} style={{borderRadius: 999}}>{item.status}</span></div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">{t("API status")}</dt><dd className="font-medium">{t("Not tested")}</dd></div><div><dt className="text-slate-500">{t("OAuth status")}</dt><dd className="font-medium">{t("Not connected")}</dd></div><div><dt className="text-slate-500">{t("Last success")}</dt><dd className="font-medium">{t("Never")}</dd></div><div><dt className="text-slate-500">{t("Errors")}</dt><dd className="font-medium">0</dd></div></dl>
      <div className="mt-5 flex flex-wrap gap-2"><button className="primary-button px-3 py-2"><Link2 size={15}/>{t("Connect")}</button><button className="secondary-button px-3 py-2" disabled><Unplug size={15}/>{t("Disconnect")}</button><button className="secondary-button px-3 py-2"><FlaskConical size={15}/>{t("Test")}</button>{admin && <button className="icon-button" title={t("Configure")} onClick={()=>setExpanded(!expanded)}><Settings2 size={16}/></button>}</div>
      <div className="mt-4 flex items-center gap-2 border-t border-line pt-4"><code className="min-w-0 flex-1 truncate text-xs text-slate-600">{item.redirectUri}</code><button className="icon-button h-8 w-8" title="Copy redirect URI" onClick={copy}>{copied ? <Check size={14}/> : <Clipboard size={14}/>}</button></div>
      <div className="mt-3 flex justify-between text-sm"><Link className="font-medium text-ink underline" href={admin ? "/admin/logs" : "/dashboard/accounts"}>{t("View logs")}</Link><a className="inline-flex items-center gap-1 text-slate-600 hover:text-ink" href={item.documentationUrl} target="_blank" rel="noreferrer">{t("Official documentation")} <ExternalLink size={13}/></a></div>
    </div>
    {expanded && <div className="border-t border-line bg-slate-50 p-5"><h3 className="font-semibold">{item.name} {t("configuration · Development")}</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-sm">Client ID<input className="mt-1 w-full border border-line bg-white p-2.5" placeholder={t("Not connected")} /></label><label className="text-sm">{t("Client Secret")}<input className="mt-1 w-full border border-line bg-white p-2.5" type="password" placeholder={t("Stored encrypted · never displayed")} /></label><label className="text-sm">{t("API version")}<input className="mt-1 w-full border border-line bg-white p-2.5" defaultValue={item.apiVersion}/></label><label className="text-sm">{t("Scopes")}<input className="mt-1 w-full border border-line bg-white p-2.5" defaultValue={item.code === "tiktok" ? "user.info.basic,video.publish" : ""}/></label></div><p className="mt-3 text-xs text-slate-500">{t("Secrets are sent directly to the backend and are never returned by the API.")}</p><div className="mt-4 flex gap-2"><button className="primary-button px-3 py-2">{t("Save securely")}</button><button className="secondary-button px-3 py-2">{t("Validate credentials")}</button></div></div>}
  </article>;
}

export function IntegrationCenter({ admin = false }: { admin?: boolean }) { return <div className="grid gap-4 xl:grid-cols-2">{integrations.map(item=><PlatformCard key={item.code} item={item} admin={admin}/>)}</div>; }
