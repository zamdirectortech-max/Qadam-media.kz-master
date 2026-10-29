import Link from "next/link";
import type { ReactNode } from "react";

type Section = {
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
};

export function LegalPage({ eyebrow, title, intro, sections }: LegalPageProps) {
  return (
    <main className="legal-shell">
      <header className="legal-header">
        <Link href="/" className="brand-lockup" aria-label="Qadam Media — главная">
          <span>Q</span>
          <strong>QADAM MEDIA</strong>
        </Link>
        <Link href="/" className="legal-back">Вернуться на главную</Link>
      </header>

      <article className="legal-document">
        <div className="legal-hero">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <p className="legal-intro">{intro}</p>
          <p className="legal-date">Последнее обновление: 5 октября 2026 года</p>
        </div>

        <div className="legal-content">
          {sections.map((section, index) => (
            <section key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </article>

      <footer className="legal-footer">
        <span>© 2026 Qadam Media</span>
        <nav aria-label="Юридические документы">
          <Link href="/terms">Условия использования</Link>
          <Link href="/privacy">Политика конфиденциальности</Link>
        </nav>
      </footer>
    </main>
  );
}
