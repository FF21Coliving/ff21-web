import type { Metadata } from "next";
import { ArticleContent, articleMetadata, articleParams, findArticle } from "@/components/wix-article";

// These pages are all prerendered; looking the URL up before rendering lets
// unknown ones answer a real 404, which matters more here than instant
// client-side navigation.
export const instant = false;

export function generateStaticParams() {
  return articleParams("blog");
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  return articleMetadata("blog", (await params).slug);
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  return <ArticleContent article={await findArticle("blog", params)} />;
}
