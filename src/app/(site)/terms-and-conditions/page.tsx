import type { Metadata } from "next";
import terms from "@/content/legal/terms.json";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The terms for using the FF21 website.",
  alternates: { canonical: "/terms-and-conditions" },
};

// Same URL as the old site, so existing links keep working.
export default function TermsPage() {
  return <LegalPage title="Terms and conditions" blocks={terms} note="Carried over from the previous site. Due for review." />;
}
