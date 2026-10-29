import Link from "next/link";
import { Activity, AlertTriangle, PlugZap, ScrollText } from "lucide-react";
import { PageHeading } from "@/components/page-heading";

const sections = [
  { href: "/admin/integrations", title: "API-интеграции", text: "Настройка провайдеров, OAuth и разрешений.", icon: PlugZap },
  { href: "/admin/health", title: "Состояние платформ", text: "Доступность API и показатели запросов.", icon: Activity },
  { href: "/admin/logs", title: "Журнал запросов", text: "Диагностика запросов без секретных данных.", icon: ScrollText },
  { href: "/admin/errors", title: "Центр ошибок", text: "Ошибки интеграций и рекомендации по исправлению.", icon: AlertTriangle },
];

export default function AdminPage(){return <><PageHeading eyebrow="QADAM MEDIA ADMIN" title="Управление платформой" text="Отдельное пространство владельца системы. Обычные пользователи не имеют доступа к этим инструментам."/><div className="grid gap-4 md:grid-cols-2">{sections.map(item=>{const Icon=item.icon;return <Link href={item.href} key={item.href} className="panel p-6 transition hover:-translate-y-0.5 hover:shadow-lg"><Icon className="text-brand"/><h2 className="mt-4 text-lg font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p></Link>})}</div></>}
