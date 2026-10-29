"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageSwitcher, useLocale } from "@/components/locale-provider";
import { API_URL, authRequest } from "@/lib/backend-api";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try { const data = await authRequest("login", { email, password }); router.push(data.user.role === "USER" ? "/dashboard" : "/admin"); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Ошибка входа"); }
    finally { setLoading(false); }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-cloud px-4">
      <section className="panel w-full max-w-md p-8"><div className="mb-7 flex justify-between"><Link href="/" className="font-bold">QADAM MEDIA</Link><LanguageSwitcher compact/></div>
        <p className="muted-label">{t("Welcome back")}</p>
        <h1 className="mt-3 text-3xl font-semibold">{t("Login to QADAM MEDIA")}</h1>
        <a href={`${API_URL}/api/v1/auth/google`} className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 py-3 font-semibold text-ink transition hover:bg-slate-50">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.08 12c0-.66.11-1.3.32-1.9V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5L6.4 13.9Z"/><path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.34 2.6c.8-2.36 3-4.12 5.6-4.12Z"/></svg>
          {t("Sign in with Google")}
        </a>
        <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-line"/><span>{t("or with email")}</span><span className="h-px flex-1 bg-line"/></div>
        <form className="space-y-4" onSubmit={submit}>
          <input className="w-full border border-line px-4 py-3 outline-none focus:border-ink" style={{ borderRadius: 8 }} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <input className="w-full border border-line px-4 py-3 outline-none focus:border-ink" style={{ borderRadius: 8 }} placeholder={t("Password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button className="primary-button w-full disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Входим…" : t("Login")}</button>
        </form>
        <p className="mt-5 text-sm text-slate-600">{t("No account?")} <Link className="font-semibold text-ink" href="/register">{t("Register")}</Link></p>
      </section>
    </main>
  );
}
