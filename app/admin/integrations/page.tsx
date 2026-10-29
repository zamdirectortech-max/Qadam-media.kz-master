"use client";
import Link from "next/link";
import { IntegrationCenter } from "@/components/integration-center";
import { PageHeading } from "@/components/page-heading";
import { useLocale } from "@/components/locale-provider";
export default function AdminIntegrationsPage(){const {t}=useLocale();return <><PageHeading eyebrow="Admin · API Integrations" title="Integration control center" text="Configure each provider independently across development, staging and production. No platform is marked connected until a real API check succeeds."/><div className="mb-5 flex flex-wrap gap-2"><Link className="secondary-button px-3 py-2" href="/admin/logs">{t("API Logs")}</Link><Link className="secondary-button px-3 py-2" href="/admin/health">{t("API Health")}</Link><Link className="secondary-button px-3 py-2" href="/admin/errors">{t("Error Center")}</Link></div><IntegrationCenter admin/></>}
