import type { Metadata } from "next";
import { Eyebrow } from "@/components/sections";
import { container, lead, pageTitle } from "@/components/ui";
import { ArticleCard } from "@/components/wix-article";
import { articles } from "@/lib/wix-content";

export const metadata: Metadata = {
  title: { absolute: "Coliving & PG Living Guides for Bangalore | FF21 Blog" },
  description: "Guides to PGs and coliving in Bangalore: neighbourhoods, rent, food, events and what to know before you move, from the FF21 team.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <section className={`${container} pb-20 pt-10 md:pb-28 md:pt-14`}>
      <Eyebrow>The FF21 blog</Eyebrow>
      <h1 className={`rise mt-5 ${pageTitle}`}>Living in Bangalore</h1>
      <p className={`rise-2 mt-5 max-w-2xl ${lead}`}>Guides to PGs and coliving, neighbourhoods, food and things to do, from the FF21 team.</p>
      <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <li key={a.path}>
            <ArticleCard article={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}
