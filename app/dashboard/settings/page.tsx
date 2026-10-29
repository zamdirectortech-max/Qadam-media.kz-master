"use client";
import { LanguageSwitcher, useLocale } from "@/components/locale-provider";
import { PageHeading } from "@/components/page-heading";
export default function SettingsPage(){const {t}=useLocale();return <><PageHeading eyebrow="Settings" title="Security, localization and workspace controls" text="JWT auth, OAuth providers, audit logs, rate limits and locale preferences belong here."/><section className="panel p-6"><h2 className="text-lg font-semibold">{t("Interface language")}</h2><p className="mt-2 text-sm text-slate-500">{t("Language changes apply instantly and are saved on this device.")}</p><div className="mt-5"><LanguageSwitcher/></div></section></>}
