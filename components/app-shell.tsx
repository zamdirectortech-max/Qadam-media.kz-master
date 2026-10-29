"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Plus, Shield } from "lucide-react";
import { navItems } from "@/lib/data";
import { clsx } from "clsx";
import { LanguageSwitcher, useLocale } from "@/components/locale-provider";
import { authRequest, type AuthUser } from "@/lib/backend-api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    authRequest("me").then((data) => setUser(data.user)).catch(async () => {
      try { const data = await authRequest("refresh", {}); setUser(data.user); }
      catch { router.replace("/login"); }
    });
  }, [router]);

  async function logout() {
    await authRequest("logout", {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cloud">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-line bg-white px-5 py-6 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-ink text-sm font-bold text-white" style={{ borderRadius: 8 }}>
            QM
          </div>
          <div>
            <p className="text-sm font-bold">QADAM MEDIA</p>
            <p className="text-xs text-slate-500">AI social workspace</p>
          </div>
        </Link>
        <Link href="/dashboard/create" className="primary-button mt-8 w-full">
          <Plus size={17} />
          {t("Create new content")}
        </Link>
        <nav className="mt-7 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand text-white shadow-[0_8px_22px_rgba(0,175,202,0.22)]" : "text-slate-600 hover:bg-cyan-50 hover:text-ink",
                )}
                style={{ borderRadius: 8 }}
              >
                <Icon size={18} />
                {t(item.label)}
              </Link>
            );
          })}
          {user && user.role !== "USER" && <Link href="/admin" className="mt-4 flex items-center gap-3 border-t border-line px-3 pt-5 text-sm font-semibold text-ink"><Shield size={18}/>Панель администратора</Link>}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur md:px-8">
          <div>
            <p className="text-sm font-semibold">{t("Agency workspace")}</p>
            <p className="text-xs text-slate-500">{t("Client A / Kazakhstan market")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="secondary-button hidden px-3 py-2 md:inline-flex" onClick={logout} title="Выйти">
              {user?.full_name || t("Owner")} <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="px-4 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
