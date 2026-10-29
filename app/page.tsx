"use client";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, Check, ChevronRight, CircleUserRound, Layers3, Send, Sparkles, WandSparkles } from "lucide-react";
import { LanguageSwitcher, useLocale } from "@/components/locale-provider";
import { KazakhSkyCanvas } from "@/components/kazakh-sky-canvas";

export default function LandingPage() {
  const { t } = useLocale();
  const workflow = ["Upload", "AI create", "Adapt", "Schedule", "Publish", "Analyze"];
  const features = [
    { icon: Layers3, title: "One source", text: "Text, photos, videos and ideas enter one creation flow." },
    { icon: WandSparkles, title: "AI adapts", text: "Platform presets create native captions, scripts, tags and calls to action." },
    { icon: BarChart3, title: "Learn faster", text: "Analytics shows what works and what to improve next." },
  ];
  return <main className="landing-shell">
    <section className="landing-hero">
      <KazakhSkyCanvas />
      <nav className="landing-nav">
        <Link href="/" className="brand-lockup"><span>Q</span><strong>QADAM MEDIA</strong></Link>
        <div className="hidden items-center gap-7 text-sm font-medium lg:flex"><a href="#platform">{t("Platform")}</a><a href="#workflow">{t("Workflow")}</a><Link href="/login">{t("Login")}</Link></div>
        <div className="flex items-center gap-3"><LanguageSwitcher /><Link className="icon-button" href="/register" aria-label={t("Register")} title={t("Register")}><CircleUserRound size={20}/></Link><Link className="primary-button hidden px-4 py-2 sm:inline-flex" href="/register">{t("Start free")}</Link></div>
      </nav>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow-light"><Sparkles size={14}/>{t("AI-powered social media management")}</p>
          <h1><span className="qadam-word">QADAM</span><br/><span>MEDIA</span></h1>
          <p className="hero-tagline">{t("Create once. Publish everywhere.")}</p>
          <p className="hero-text">{t("Create content once. QADAM MEDIA adapts it for every social platform and keeps planning, publishing and analytics in one clear workspace.")}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link className="accent-button" href="/register">{t("Try for free")}<ArrowRight size={18}/></Link><Link className="ghost-button" href="/dashboard">{t("View dashboard")}<ChevronRight size={17}/></Link></div>
        </div>
        <div className="product-stage" aria-label="QADAM MEDIA product preview">
          <div className="stage-top"><div><span className="stage-kicker">QADAM / STUDIO</span><h2>{t("One operating system for your social media")}</h2></div><span className="live-dot">LIVE</span></div>
          <div className="stage-body"><aside>{[CalendarDays, WandSparkles, Send, BarChart3].map((Icon,i)=><span key={i} className={i===1?"selected":""}><Icon size={18}/></span>)}</aside><div className="stage-content"><div className="stage-editor"><div className="stage-line wide"/><div className="stage-line"/><div className="stage-media"><Sparkles size={30}/></div><div className="stage-actions"><span/><span/><button><WandSparkles size={15}/> AI</button></div></div><div className="stage-results"><p>PLATFORM VARIANTS</p>{["Instagram","TikTok","Telegram"].map((x,i)=><div key={x}><span className={`platform-mark p${i}`}/><strong>{x}</strong><Check size={14}/></div>)}</div></div></div>
          <div className="stage-footer">{["Plan","Create","Publish","Analyze"].map((x,i)=><div key={x}><b>0{i+1}</b><span>{t(x)}</span></div>)}</div>
        </div>
      </div>
      <div className="hero-ticker"><span>INSTAGRAM</span><span>TIKTOK</span><span>TELEGRAM</span><span>YOUTUBE</span><span>LINKEDIN</span><span>FACEBOOK</span></div>
    </section>
    <section id="platform" className="landing-band"><div className="section-intro"><p>QADAM / 01</p><h2>{t("From first idea to measurable result")}</h2></div><div className="feature-grid">{features.map(({icon:Icon,title,text},i)=><article key={title}><span>0{i+1}</span><Icon size={25}/><h3>{t(title)}</h3><p>{t(text)}</p></article>)}</div></section>
    <section id="workflow" className="workflow-band"><div className="section-intro light"><p>QADAM / 02</p><h2>{t("Workflow")}</h2></div><div className="workflow-row">{workflow.map((step,i)=><div key={step}><b>{String(i+1).padStart(2,"0")}</b><span>{t(step)}</span>{i<workflow.length-1&&<ArrowRight size={18}/>}</div>)}</div></section>
    <footer className="landing-footer"><span>© 2026 Qadam Media</span><nav aria-label="Юридические документы"><Link href="/terms">Условия использования</Link><Link href="/privacy">Политика конфиденциальности</Link></nav></footer>
  </main>;
}
