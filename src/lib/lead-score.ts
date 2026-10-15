import { fromPrice, getProperty, properties } from "./properties";

// A first guess at how warm a website lead is, out of 10, written to Zoho's
// Lead Qualification (Hot / Warm / Cold) so the team knows whom to call first.
// The team changes it after they call; the site only sets it while the visitor
// is still filling the form. Agreed with Madhvik on 15 Oct 2026.
//
//   Move-in   ASAP or within 30 days 3 · next month 2 · in two months 1 · flexible 0
//   Stay      6 months or a year+ 2 · 3 months 1 · less than 3 months 0
//   Budget    the chosen home fits, or no ceiling 2 · some home fits 1 · none 0
//   Finished  answered the last step 2
//   Friend    Reference, Walk Ins or a referral code 1
//
// Hot is 7 and up, Warm 4 to 6, Cold 3 and below.

export type Qualification = "Hot" | "Warm" | "Cold";

export type ScoreInput = {
  moveIn?: string;
  stay?: string;
  budget?: string;
  property?: string;
  source?: string;
  referralCode?: string;
  finished?: boolean;
};

const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

// "On 3 November 2026", from the date picker.
function daysUntil(moveIn: string, now: number) {
  const m = /(\d{1,2}) ([a-z]+) (\d{4})/i.exec(moveIn);
  const month = m ? months.indexOf(m[2].toLowerCase()) : -1;
  if (!m || month < 0) return undefined;
  return (Date.UTC(Number(m[3]), month, Number(m[1])) - now) / 86_400_000;
}

function moveInPoints(moveIn: string | undefined, now: number): [number, string?] {
  if (!moveIn) return [0];
  if (moveIn === "As soon as possible") return [3, "moving ASAP"];
  if (moveIn === "Next month") return [2, "moving next month"];
  if (moveIn === "In two months") return [1, "moving in two months"];
  const days = daysUntil(moveIn, now);
  if (days === undefined) return [0];
  if (days <= 30) return [3, "moving within 30 days"];
  if (days <= 60) return [2, "moving within 60 days"];
  return [1, "moving later"];
}

function stayPoints(stay: string | undefined): [number, string?] {
  if (stay === "6 months" || stay === "1 year and more") return [2, stay === "6 months" ? "6 months" : "a year or more"];
  if (stay === "3 months") return [1, "3 months"];
  if (stay === "Less than 3 months") return [0, "under 3 months"];
  return [0];
}

// The most a visitor said they'd pay a month; null means no ceiling.
function budgetCeiling(budget: string): number | null | undefined {
  if (/^(above|no fixed)/i.test(budget)) return null;
  const amounts = budget.match(/\d[\d,]*/g);
  return amounts ? Number(amounts[amounts.length - 1].replace(/,/g, "")) : undefined;
}

function budgetPoints(budget: string | undefined, property: string | undefined): [number, string?] {
  if (!budget) return [0];
  const max = budgetCeiling(budget);
  if (max === undefined) return [0];
  if (max === null) return [2, "budget open"];
  const chosen = property ? getProperty(property) : undefined;
  const chosenFrom = chosen ? fromPrice(chosen) : undefined;
  if (chosenFrom !== undefined && chosenFrom <= max) return [2, "within budget"];
  if (properties.some((p) => (fromPrice(p) ?? Infinity) <= max)) return [1, "budget fits some homes"];
  return [0, "below our prices"];
}

export function scoreLead(i: ScoreInput, now = Date.now()) {
  const parts = [
    moveInPoints(i.moveIn, now),
    stayPoints(i.stay),
    budgetPoints(i.budget, i.property),
    i.finished ? ([2, "finished the form"] as [number, string]) : ([0, "didn't finish the form"] as [number, string]),
    i.source === "Reference" || i.source === "Walk Ins" || i.referralCode ? ([1, "came through a friend"] as [number, string]) : ([0] as [number]),
  ];
  const score = parts.reduce((sum, [n]) => sum + n, 0);
  const qualification: Qualification = score >= 7 ? "Hot" : score >= 4 ? "Warm" : "Cold";
  const reasons = parts.map(([, why]) => why).filter(Boolean);
  return { score, qualification, note: `Website score: ${qualification} ${score}/10 (${reasons.join(", ")})` };
}

export const scoreFields = (s: ReturnType<typeof scoreLead>) => ({ qualification: s.qualification, scoreNote: s.note });
