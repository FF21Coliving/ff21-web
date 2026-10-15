import type { Metadata } from "next";
import privacy from "@/content/legal/privacy.json";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How FF21 collects, uses and protects your personal information.",
  alternates: { canonical: "/privacypolicy" },
};

// Same URL as the old site, so existing links keep working.
export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" blocks={privacy} note="Carried over from the previous site. Due for review." />;
}
