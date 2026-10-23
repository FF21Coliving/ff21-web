import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeCard } from "@/components/home-card";
import { FindHomeBand } from "@/components/sections";
import { container } from "@/components/ui";
import { WixCopy } from "@/components/wix-copy";
import { ogImage, photos } from "@/lib/photos";
import { breadcrumbs } from "@/lib/schema";
import { site } from "@/lib/site";
import { articles, getArticle, homesForArticle, relatedArticles, type Article } from "@/lib/wix-content";

// Blog articles carried over from the Wix site, at the same /blog/… and
// /post/… URLs, with the same titles and words.

type Prefix = "blog" | "post";

export const articleParams = (prefix: Prefix) =>
  articles.filter((a) => a.path.startsWith(`/${prefix}/`)).map((a) => ({ slug: a.path.slice(prefix.length + 2) }));

// Unknown URLs must answer 404 before anything streams, so look up first.
export async function findArticle(prefix: Prefix, params: Promise<{ slug: string }>) {
  const a = getArticle(prefix, (await params).slug);
  if (!a) notFound();
  return a;
}

export function articleMetadata(prefix: Prefix, slug: string): Metadata {
  const a = getArticle(prefix, slug);
  if (!a) return {};
  return {
    title: { absolute: a.title },
    description: a.description ?? undefined,
    alternates: { canonical: a.url },
    // Its own openGraph replaces the layout's, so it carries the site name and
    // a picture too: the article's cover, else the site's.
    openGraph: {
      type: "article",
      title: a.title,
      description: a.description ?? undefined,
      url: a.url,
      siteName: site.name,
      images: [{ url: shareImage(a), width: 1200, height: 630 }],
      ...(a.date ? { modifiedTime: a.date } : {}),
    },
    twitter: { card: "summary_large_image", images: [shareImage(a)] },
  };
}

const shareImage = (a: Article) => ogImage(a.image ? { id: a.image, alt: a.title } : photos.rooftopSunset);

export const formatDate = (d?: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : undefined;

function jsonLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumbs([["FF21", "/"], ["Blog", "/blog"], [a.heading, a.url]]), blogPosting(a)],
  };
}

function blogPosting(a: Article) {
  return {
    "@type": "BlogPosting",
    headline: a.heading,
    description: a.description ?? undefined,
    dateModified: a.date ?? undefined,
    image: shareImage(a).startsWith("http") ? shareImage(a) : `${site.url}${shareImage(a)}`,
    author: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}${a.url}`,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function ArticleContent({ article: a }: { article: Article }) {
  // The first picture leads the article; the rest stay where the writer put them.
  const lead = a.blocks.findIndex((b) => b.t === "img");
  const cover = lead >= 0 && lead < 4 ? a.blocks[lead] : undefined;
  const body = cover ? a.blocks.filter((_, i) => i !== lead) : a.blocks;
  const related = relatedArticles(a);
  const near = homesForArticle(a);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(a)).replace(/</g, "\\u003c") }} />
      <article className={`${container} pb-20 pt-10 md:pb-28 md:pt-14`}>
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-blue-ink transition-colors hover:text-ink">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            The FF21 blog
          </Link>
          <h1 className="mt-6 font-display text-[34px] font-extrabold leading-[40px] tracking-[-0.03em] text-ink md:text-[48px] md:leading-[54px]">{a.heading}</h1>
          {a.date && <p className="mt-4 text-[15px] text-ink-3">Updated {formatDate(a.date)}</p>}
          {cover && cover.t === "img" && (
            <Image src={cover.id} alt={cover.alt || a.heading} width={1200} height={760} priority sizes="(min-width: 768px) 768px, 100vw" className="mt-8 h-auto w-full rounded-2xl bg-mist" />
          )}
          <WixCopy blocks={body} className="mt-10" />
        </div>
      </article>

      {near && (
        <section aria-labelledby="near-title" className={`${container} pb-16 md:pb-20`}>
          <h2 id="near-title" className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">
            {near.homes.length === 1 ? "The FF21 home" : "FF21 homes"} near {near.place}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {near.homes.map((p) => (
              <HomeCard key={p.slug} property={p} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" />
            ))}
          </div>
        </section>
      )}

      {related.cards.length > 0 && (
        <section aria-labelledby="more-title" className={`${container} pb-20 md:pb-28`}>
          <h2 id="more-title" className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">Related reads</h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {related.cards.map((m) => (
              <li key={m.path}>
                <ArticleCard article={m} />
              </li>
            ))}
          </ul>
          {related.more.length > 0 && (
            <p className="mt-8 text-[15px] leading-6 text-ink-2">
              Also worth a read:{" "}
              {related.more.map((m, i) => (
                <span key={m.path}>
                  {i > 0 && " · "}
                  <Link href={m.url} className="font-medium text-blue-ink transition-colors hover:text-ink">
                    {m.heading}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </section>
      )}
      <FindHomeBand />
    </>
  );
}

export function ArticleCard({ article: a }: { article: Article }) {
  return (
    <Link href={a.url} className="group block">
      <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-mist">
        {a.image && (
          <Image src={a.image} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
      </span>
      <span className="mt-3 block font-display text-[18px] font-bold leading-[24px] tracking-[-0.01em] text-ink transition-colors group-hover:text-blue-ink">{a.heading}</span>
      {a.date && <span className="mt-1 block text-[13.5px] text-ink-3">{formatDate(a.date)}</span>}
    </Link>
  );
}
