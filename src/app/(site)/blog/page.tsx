import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/sections";
import { container, lead, pageTitle } from "@/components/ui";
import { ArticleCard } from "@/components/wix-article";
import { breadcrumbs, ldScript } from "@/lib/schema";
import { articles, blogTopics } from "@/lib/wix-content";

export const metadata: Metadata = {
  title: { absolute: "Coliving & PG Living Guides for Bangalore | FF21 Blog" },
  description: "Guides to PGs and coliving in Bangalore: neighbourhoods, rent, food, events and what to know before you move, from the FF21 team.",
  alternates: { canonical: "/blog" },
};

const LATEST = 12;
const latest = [...articles].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, LATEST);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

// The newest posts as cards, then every post as a plain link, by topic. One
// page still links every post (so search engines reach them all in one step),
// without 229 picture cards: the page went from about 518 KB to a fraction.
export default function BlogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript({ "@graph": [breadcrumbs([["FF21", "/"], ["Blog", "/blog"]])] })} />
      <section className={`${container} pb-16 pt-10 md:pb-20 md:pt-14`}>
        <Eyebrow>The FF21 blog</Eyebrow>
        <h1 className={`rise mt-5 ${pageTitle}`}>Living in Bangalore</h1>
        <p className={`rise-2 mt-5 max-w-2xl ${lead}`}>Guides to PGs and coliving, neighbourhoods, food and things to do, from the FF21 team.</p>
        <nav aria-label="Topics" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {blogTopics.map((t) => (
              <li key={t.name}>
                <a href={`#${slug(t.name)}`} className="inline-flex h-9 items-center rounded-full border border-line-soft px-4 text-[14px] font-medium text-ink transition-colors hover:border-ink">
                  {t.name} <span className="ml-1.5 text-ink-3">{t.posts.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <h2 className="mt-14 font-display text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">Latest</h2>
        <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <li key={a.path}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="all-posts" className={`${container} pb-20 md:pb-28`}>
        <h2 id="all-posts" className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">
          Every guide, by topic
        </h2>
        <div className="mt-8 grid gap-x-12 gap-y-12 lg:grid-cols-2">
          {blogTopics.map((t) => (
            <section key={t.name} id={slug(t.name)} aria-labelledby={`${slug(t.name)}-title`} className="scroll-mt-28">
              <h3 id={`${slug(t.name)}-title`} className="text-[18px] font-bold text-ink">
                {t.name} <span className="font-normal text-ink-3">· {t.posts.length}</span>
              </h3>
              <ul className="mt-4 space-y-2.5">
                {t.posts.map((a) => (
                  <li key={a.path}>
                    <Link href={a.url} className="text-[15px] leading-6 text-ink-2 transition-colors hover:text-blue-ink">
                      {a.heading}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
