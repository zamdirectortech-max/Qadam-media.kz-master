"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, AlertTriangle, ArrowLeft, LayoutDashboard, LogOut, PlugZap, ScrollText, Shield } from "lucide-react";
import { clsx } from "clsx";
import { authRequest, type AuthUser } from "@/lib/backend-api";

const adminNav = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/integrations", label: "API-интеграции", icon: PlugZap },
  { href: "/admin/health", label: "Состояние платформ", icon: Activity },
  { href: "/admin/logs", label: "Журнал API", icon: ScrollText },
  { href: "/admin/errors", label: "Центр ошибок", icon: AlertTriangle },
];

export function AdminShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();const router=useRouter();const [user,setUser]=useState<AuthUser|null>(null);const [denied,setDenied]=useState(false);
  useEffect(()=>{authRequest("me").then(data=>{if(data.user.role==="USER"){setDenied(true);router.replace("/dashboard");return}setUser(data.user)}).catch(()=>router.replace("/login"))},[router]);
  async function logout(){await authRequest("logout",{});router.replace("/login");router.refresh()}
  if(denied)return <main className="grid min-h-screen place-items-center bg-cloud"><p>Доступ запрещён. Возвращаем в кабинет…</p></main>;
  if(!user)return <main className="grid min-h-screen place-items-center bg-cloud"><p>Проверяем права администратора…</p></main>;
  return <div className="min-h-screen bg-slate-100"><aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-800 bg-slate-950 px-5 py-6 text-white lg:block"><Link href="/admin" className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-brand"><Shield size={20}/></div><div><b className="text-sm">QADAM MEDIA ADMIN</b><p className="text-xs text-slate-400">Управление системой</p></div></Link><nav className="mt-8 space-y-1">{adminNav.map(item=>{const Icon=item.icon;const active=pathname===item.href;return <Link key={item.href} href={item.href} className={clsx("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",active?"bg-brand font-semibold text-white":"text-slate-300 hover:bg-slate-900")}><Icon size={18}/>{item.label}</Link>})}</nav><Link href="/dashboard" className="mt-8 flex items-center gap-2 border-t border-slate-800 px-3 pt-6 text-sm text-slate-300"><ArrowLeft size={17}/>Пользовательский кабинет</Link></aside><main className="lg:pl-72"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-4 md:px-8"><div><b className="text-sm">Панель владельца</b><p className="text-xs text-slate-500">{user.email} · {user.role}</p></div><button className="secondary-button px-3 py-2" onClick={logout}>Выйти <LogOut size={16}/></button></header><div className="px-4 py-8 md:px-8">{children}</div></main></div>
}
