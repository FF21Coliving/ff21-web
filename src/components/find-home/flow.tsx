"use client";

import { ArrowLeft, Building, Building2, Check, CircleAlert, Footprints, MapPin, Plus, Search, Smartphone, Users, Video, X, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { readAttribution } from "@/lib/attribution";
import { genders, inferSource, istDay, normalizePhone, stays, visitLabel, visitWindowHours, visitWindows, type Gender, type LeadErrors, type Source, type Stay, type VisitType, type VisitWindow } from "@/lib/lead";
import { own, photos, type Photo } from "@/lib/photos";
import { fromPrice, getProperty, homesNear, isCollege, nearPlace, places, properties, roomKindLabels, roomKinds, searchNames, zones, type RoomKind } from "@/lib/properties";
import { isFullPincode, isPincodeQuery, pincodes } from "@/lib/pincodes";
import { inr, site, whatsappLink } from "@/lib/site";
import { track } from "@/lib/track";
import { TrackedLink } from "../tracked-link";
import { button } from "../ui";

// Contact details come first, so every answer after them is saved to a lead
// the team can call, even if the visitor stops halfway.
const STEPS = ["you", "where", "movein", "stay", "budget", "room", "who", "home", "visit", "heard"] as const;

// What the progress line says: speed and momentum, not steps to go.
const cheer = (i: number) =>
  i === 0 ? "About a minute · no sign-up" : i === STEPS.length - 1 ? "Last one!" : i <= 2 ? "Great start" : i <= 5 ? "Halfway there" : "Almost done";
// The bar starts a fifth full, so the first screen already feels under way.
const progressOf = (i: number) => Math.round(20 + (80 * i) / (STEPS.length - 1));
type StepId = (typeof STEPS)[number];
type RoomChoice = RoomKind | "unsure";
type Budget = { label: string; max: number | null };

type Answers = {
  places: string[];
  moveIn?: string;
  stay?: Stay;
  budget?: Budget;
  room?: RoomChoice;
  property?: string;
  gender?: Gender;
  visitDay?: string;
  visitWindow?: VisitWindow;
  visitType: VisitType;
  source?: Source;
  referralCode?: string;
};

// Picklist values Zoho expects, in words people use.
const sourceChoices: { id: Source; label: string; icon: LucideIcon }[] = [
  { id: "Google", label: "Google", icon: Search },
  { id: "Social Media", label: "Instagram or Facebook", icon: Smartphone },
  { id: "Reference", label: "A friend", icon: Users },
  { id: "Housing.com", label: "Housing.com", icon: Building2 },
  { id: "MagicBricks", label: "Magicbricks", icon: Building },
  { id: "Walk Ins", label: "Walked past a home", icon: Footprints },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// The same checks the server makes, so mistakes show before anything is sent.
function checkField(name: string, value: string): string | undefined {
  const v = value.trim();
  if (name === "firstName" && !v) return "Please add your first name.";
  if (name === "lastName" && !v) return "Please add your last name.";
  if (name === "phone" && !normalizePhone(v)) return "Enter a 10-digit mobile number, like 98765 43210.";
  if (name === "email" && !emailPattern.test(v)) return "Enter an email like name@example.com.";
  return undefined;
}

const popular = ["ITPL", "EPIP Zone", "Whitefield", "Bagmane Tech Park", "Marathahalli", "Ecospace", "Bellandur", "Embassy Tech Village", "Manyata Tech Park", "Koramangala", "HSR Layout", "Sarjapur Road"];
// The next seven visiting days in Bangalore time. Today counts while at least
// one part of the day is still more than an hour away from ending.
const windowEnds: Record<VisitWindow, number> = { Morning: 12, Afternoon: 16, Evening: 20 };
const istHour = (at: number) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", hourCycle: "h23" }).format(at));
function visitDays() {
  const now = Date.now();
  const hour = istHour(now);
  const today = istDay(now);
  const start = hour + 1 < windowEnds.Evening ? 0 : 1;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.parse(`${today}T00:00:00Z`) + (start + i) * 86_400_000);
    const day = d.toISOString().slice(0, 10);
    const n = start + i;
    return {
      day,
      top: n === 0 ? "Today" : n === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
      bottom: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }),
      open: visitWindows.filter((w) => n > 0 || hour + 1 < windowEnds[w]),
    };
  });
}

// One id per visit to the form, kept for the tab's life so every save lands
// on the same lead.
function sessionLeadId() {
  let id = "";
  try {
    id = sessionStorage.getItem("ff21-lead-id") ?? "";
  } catch {}
  if (!id) id = crypto.randomUUID();
  try {
    sessionStorage.setItem("ff21-lead-id", id);
  } catch {}
  return id;
}

const moveIns = ["As soon as possible", "Next month", "In two months", "I'm flexible"];
const budgets: Budget[] = [
  { label: "Under ₹12,000", max: 12000 },
  { label: "₹12,000 to ₹15,000", max: 15000 },
  { label: "₹15,000 to ₹20,000", max: 20000 },
  { label: "₹20,000 to ₹30,000", max: 30000 },
  { label: "Above ₹30,000", max: null },
  { label: "No fixed budget", max: null },
];
const roomChoices: { id: RoomChoice; title: string; body: string; photo?: Photo }[] = [
  { id: "twin", title: "Twin", body: "Share a room with one person", photo: photos.roomTwin },
  { id: "private", title: "Private", body: "A room to yourself", photo: photos.roomPrivate },
  { id: "pod", title: "Pod", body: "A compact private pod, at a lower rent", photo: own("pods-pod", "Pod with a single bed and an abstract print") },
  { id: "studio", title: "Studio", body: "More space, with a kitchenette", photo: photos.roomStudio },
  { id: "unsure", title: "Not sure yet", body: "We'll show you options on the visit" },
];

const copy: Record<StepId, { title: string; lead: string }> = {
  where: { title: "Where do you work or study?", lead: "Search an area, tech park, college or pincode. Pick up to three places." },
  movein: { title: "When would you like to move in?", lead: "Our team will check which rooms are free around then." },
  stay: { title: "How long will you stay?", lead: "Our minimum stay is three months. Staying less? Choose it anyway and our team will tell you what's possible." },
  budget: { title: "What's your monthly budget?", lead: "Per person, with meals, taxes and charges included." },
  room: { title: "What kind of room would you like?", lead: "You can change your mind on the visit." },
  home: { title: "Pick a home to visit", lead: "Ranked by what you told us. You can ask to see more than one." },
  heard: { title: "Last thing: how did you hear about us?", lead: "It helps us know what's working. Got a referral code from a friend? Add it below." },
  who: { title: "Who's moving in?", lead: "So we can suggest the right room." },
  visit: { title: "When would you like to visit?", lead: `Pick a day and a time of day. Our team will confirm on WhatsApp. Visits ${site.visitHours}.` },
  you: { title: "Let's find your home", lead: "Where should we send your matches? Our team calls or WhatsApps you to set up a visit. No spam, ever." },
};

function rank(answers: Answers) {
  return properties
    .map((p, order) => {
      let score = 0;
      const reasons: string[] = [];
      const near = answers.places.filter((pl) => nearPlace(p, pl));
      if (near.length) {
        score += 3 * near.length;
        reasons.push(`Near ${near[0]}`);
      }
      const from = fromPrice(p);
      if (answers.budget?.max && from) {
        if (from <= answers.budget.max) {
          score += 2;
          reasons.push("Within budget");
        } else score -= 1;
      }
      if (answers.room && answers.room !== "unsure" && roomKinds(p).includes(answers.room)) {
        score += 2;
        reasons.push(`${roomKindLabels[answers.room]} rooms`);
      }
      return { p, score, reasons, order };
    })
    .sort((a, b) => b.score - a.score || a.order - b.order);
}

function photoFor(step: StepId, answers: Answers): Photo {
  switch (step) {
    case "where":
      return photos.rooftopSunset;
    case "movein":
      return photos.loungeTeal;
    case "stay":
      return photos.diningHall;
    case "budget":
      return photos.workspace;
    case "room":
      return answers.room === "private" ? photos.roomPrivate : answers.room === "studio" ? photos.roomStudio : photos.roomTwin;
    case "home":
      return getProperty(answers.property ?? "")?.hero ?? photos.rooftopDeck;
    case "who":
      return photos.holi;
    case "visit":
      return getProperty(answers.property ?? "")?.hero ?? photos.loungeTeal;
    case "you":
      return photos.diningFamily;
    case "heard":
      return photos.partyFriends;
  }
}

const option =
  "flex w-full items-center justify-between gap-4 rounded-lg border px-5 py-4 text-left text-[16px] font-medium transition-[border-color,background-color,box-shadow] duration-150";
const optionOff = "border-line-soft bg-surface text-ink hover:border-ink";
const optionOn = "border-blue-ink bg-blue-50 text-ink shadow-[inset_0_0_0_1px_var(--color-blue-ink)]";
const field =
  "mt-1.5 h-12 w-full rounded-md border border-line-strong bg-surface px-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-blue-ink focus:outline-none focus:ring-2 focus:ring-blue-100 aria-[invalid=true]:border-danger";
const label = "text-[14px] font-semibold text-ink";

const noSubscribe = () => () => {};
const inferredSource = () => inferSource(readAttribution());

// Milliseconds since the visitor opened the flow (a spam check), read in handlers.
const since = (start: number) => Date.now() - start;

function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-[14px] font-medium text-danger">
      <CircleAlert aria-hidden className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

type TextFieldProps = Omit<React.ComponentProps<"input">, "prefix"> & {
  name: string;
  label: string;
  hint?: string;
  prefix?: string;
  optional?: boolean;
  error?: string;
  onCheck?: (name: string, value: string) => void;
  onValue?: (value: string) => void;
};

// A labelled field: big enough to tap, clear focus, and its error right under it.
function TextField({ name, label: text, hint, prefix, optional, error, onCheck, onValue, ...rest }: TextFieldProps) {
  const described = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className="text-[14px] font-semibold text-ink">
        {text}
        {optional && <span className="font-normal text-ink-3"> (optional)</span>}
      </label>
      <div className="relative mt-2">
        {prefix && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-line pl-4 pr-3 text-[16px] font-medium text-ink-2">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          onBlur={(e) => onCheck?.(name, e.target.value)}
          onChange={(e) => {
            onValue?.(e.target.value);
            if (error) onCheck?.(name, e.target.value);
          }}
          className={`h-14 w-full rounded-xl border bg-surface text-[16px] text-ink transition-[border-color,box-shadow] placeholder:text-ink-3/70 focus:outline-none focus:ring-4 ${prefix ? "pl-[74px] pr-4" : "px-4"} ${
            error ? "border-danger focus:border-danger focus:ring-red-100" : "border-line-soft hover:border-ink-3 focus:border-blue-ink focus:ring-blue-100"
          }`}
          {...rest}
        />
      </div>
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-2 text-[13.5px] text-ink-3">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${name}-error`} message={error} />}
    </div>
  );
}

function Tick({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${on ? "border-blue-ink bg-blue-ink text-white" : "border-line-soft"}`}>
      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}

// Day, part of the day, and in person or on video. Nothing here is booked
// until the team confirms; the form says so.
function VisitPicker({ answers, onChange }: { answers: Answers; onChange: (patch: Partial<Answers>) => void }) {
  const days = visitDays();
  const picked = days.find((d) => d.day === answers.visitDay);
  const types: { id: VisitType; label: string; icon: LucideIcon }[] = [
    { id: "Physical", label: "In person", icon: Footprints },
    { id: "Virtual", label: "Video call", icon: Video },
  ];
  return (
    <div>
      <div role="radiogroup" aria-label="How you'd like to visit" className="grid grid-cols-2 gap-2">
        {types.map((t) => {
          const on = answers.visitType === t.id;
          return (
            <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => onChange({ visitType: t.id })} className={`${option} ${on ? optionOn : optionOff}`}>
              <span className="flex items-center gap-3 whitespace-nowrap">
                <t.icon aria-hidden className="h-5 w-5 shrink-0 text-blue-ink" />
                {t.label}
              </span>
              <span className="max-sm:hidden">
                <Tick on={on} />
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-[14px] font-semibold text-ink-2">Day</p>
      <ul className="-mx-5 mt-3 flex snap-x gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0">
        {days.map((d) => {
          const on = answers.visitDay === d.day;
          return (
            <li key={d.day} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ visitDay: d.day, visitWindow: answers.visitWindow && d.open.includes(answers.visitWindow) ? answers.visitWindow : undefined })}
                className={`flex h-[72px] w-[76px] flex-col items-center justify-center rounded-lg border text-center transition-[border-color,background-color,box-shadow] sm:w-full ${on ? optionOn : optionOff}`}
              >
                <span className="text-[13px] font-semibold text-ink-2">{d.top}</span>
                <span className="mt-0.5 text-[16px] font-semibold text-ink">{d.bottom}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-[14px] font-semibold text-ink-2">Time</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {visitWindows.map((w) => {
          const on = answers.visitWindow === w;
          const closed = picked ? !picked.open.includes(w) : false;
          return (
            <li key={w}>
              <button
                type="button"
                aria-pressed={on}
                disabled={closed}
                onClick={() => onChange({ visitWindow: w, visitDay: answers.visitDay ?? days.find((d) => d.open.includes(w))?.day })}
                className={`${option} h-full disabled:cursor-not-allowed disabled:opacity-40 ${on ? optionOn : optionOff}`}
              >
                <span>
                  <span className="block">{w}</span>
                  <span className="block text-[13px] font-normal text-ink-3">{visitWindowHours[w]}</span>
                </span>
                <Tick on={on} />
              </button>
            </li>
          );
        })}
      </ul>
      {answers.visitDay && !answers.visitWindow && <p className="mt-4 text-[14px] text-ink-3">Pick a time of day to continue, or skip and we&apos;ll call to fix one.</p>}
    </div>
  );
}

export function FindMyHome() {
  const params = useSearchParams();
  const startProperty = getProperty(params.get("property") ?? "")?.slug;
  // Everyone starts with their contact details; links like ?step=budget pick
  // the question that comes right after them.
  const resumeStep = (() => {
    const s = params.get("step");
    if (s && ["where", "movein", "stay", "budget", "room"].includes(s)) return s as StepId;
    return startProperty ? "movein" : "where";
  })();
  const startRoom = params.get("room");

  const [step, setStep] = useState<StepId>("you");
  const [contact, setContact] = useState<Record<string, string> | null>(null);
  const leadId = useRef("");
  // The signed Zoho reference the server returns at the contact step; it lets
  // later saves update that one lead and nothing else.
  const zohoRef = useRef<string | undefined>(undefined);
  // The contact step's save, still in flight while the visitor answers the
  // next question; later saves wait for it so they carry the Zoho reference.
  const contactSaved = useRef<Promise<void>>(Promise.resolve());
  const [answers, setAnswers] = useState<Answers>(() => ({
    places: startProperty ? [getProperty(startProperty)!.area] : [],
    property: startProperty,
    moveIn: params.get("movein") ?? undefined,
    room: startRoom === "twin" || startRoom === "private" || startRoom === "studio" ? startRoom : undefined,
    visitType: "Physical",
  }));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<LeadErrors>({});
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<{ name: string; phone: string; testMode: boolean } | null>(null);
  const [pickDate, setPickDate] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(0);
  const started = useRef(false);

  const index = STEPS.indexOf(step);
  const ranked = useMemo(() => rank(answers), [answers]);
  const photo = status === "done" ? photos.rooftopDusk : photoFor(step, answers);

  // Count each visit to the form once (no personal details), for the
  // drop-off chart's first bar.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ff21-opened")) return;
      sessionStorage.setItem("ff21-opened", "1");
    } catch {
      return;
    }
    if (!leadId.current) leadId.current = sessionLeadId();
    fetch("/api/lead/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ id: leadId.current, step: "open" }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!startedAt.current) startedAt.current = Date.now();
    heading.current?.focus();
    track("find_home_step", { step, index: index + 1 });
  }, [step, index]);

  const update = (patch: Partial<Answers>) => {
    if (!started.current) {
      started.current = true;
      track("form_start", { form: "find-my-home" });
    }
    setAnswers((a) => ({ ...a, ...patch }));
  };

  // Checked as each field is left, once something has been typed.
  const setFieldError = (name: string, value: string) => {
    if (!value.trim() && !errors[name as keyof LeadErrors]) return;
    setErrors((e) => ({ ...e, [name]: checkField(name, value) }));
  };

  const goTo = (s: StepId) => {
    // Entering "home" with nothing picked: pick the best match for them.
    if (s === "home") {
      setAnswers((a) => (a.property ? a : { ...a, property: rank(a)[0].p.slug }));
    }
    if (s === "heard" && inferred) {
      setAnswers((a) => (a.source ? a : { ...a, source: inferred }));
    }
    setStep(s);
    window.scrollTo({ top: 0 });
  };
  const idFor = () => {
    if (!leadId.current) leadId.current = sessionLeadId();
    return leadId.current;
  };

  // The answers as the lead stores them.
  const fields = (a: Answers) => ({
    places: a.places,
    moveIn: a.moveIn,
    stay: a.stay,
    budget: a.budget?.label,
    room: a.room ? (a.room === "unsure" ? "Not sure yet" : roomKindLabels[a.room]) : undefined,
    gender: a.gender,
    property: a.property,
    visitDay: a.visitDay,
    visitWindow: a.visitWindow,
    visitType: a.visitType,
    source: a.source,
    referralCode: a.referralCode,
  });

  // Saved in the background on every move forward; never blocks the visitor.
  const save = (at: StepId, a: Answers) => {
    const page = window.location.pathname + window.location.search;
    contactSaved.current
      .then(() =>
        fetch("/api/lead/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ id: idFor(), zohoRef: zohoRef.current, step: at, ...fields(a), page }),
        }),
      )
      .catch(() => {});
  };

  const next = () => {
    save(step, answers);
    goTo(STEPS[Math.min(index + 1, STEPS.length - 1)]);
  };
  const back = () => index > 0 && goTo(STEPS[index - 1]);
  const chooseAndNext = (patch: Partial<Answers>) => {
    update(patch);
    save(step, { ...answers, ...patch });
    window.setTimeout(() => goTo(STEPS[Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1)]), 220);
  };

  async function submitContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const c = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const found: LeadErrors = {};
    for (const k of ["firstName", "lastName", "phone", "email"] as const) {
      const msg = checkField(k, c[k] ?? "");
      if (msg) found[k] = msg;
    }
    if (Object.keys(found).length) {
      setErrors(found);
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setErrors({});
    // The same checks just passed here, so move on straight away and save in
    // the background; if the server still finds a problem, come back to it.
    contactSaved.current = fetch("/api/lead/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...c,
        id: idFor(),
        step: "you",
        ...fields(answers),
        attribution: readAttribution(),
        page: window.location.pathname + window.location.search,
        elapsedMs: since(startedAt.current),
      }),
    })
      .then((res) => res.json().catch(() => ({})))
      .then((body) => {
        if (body.errors) {
          setErrors(body.errors as LeadErrors);
          goTo("you");
          return;
        }
        if (typeof body.zohoRef === "string") zohoRef.current = body.zohoRef;
      })
      .catch(() => {
        // Offline for a moment: carry on; the final step sends everything again.
      });
    if (!started.current) {
      started.current = true;
      track("form_start", { form: "find-my-home" });
    }
    setContact(c);
    goTo(resumeStep);
  }

  // Where the visit came from (UTM tags, ad clicks), read only in the browser;
  // the server render asks the question, the browser hides it if it knows.
  const inferred = useSyncExternalStore(noSubscribe, inferredSource, () => undefined);

  const togglePlace = (place: string) => {
    const has = answers.places.includes(place);
    if (!has && answers.places.length >= 3) return;
    update({ places: has ? answers.places.filter((p) => p !== place) : [...answers.places, place] });
  };

  const q = query.trim();
  const areaNames = zones.map((z) => z.label);
  const shownPlaces = !q
    ? popular.filter((p) => places.includes(p) && !areaNames.includes(p))
    : isPincodeQuery(q)
      ? places.filter((p) => pincodes[p]?.startsWith(q)).slice(0, 12)
      : places.filter((p) => searchNames(p).some((n) => n.toLowerCase().includes(q.toLowerCase())) || pincodes[p] === q).slice(0, 12);
  // A full pincode we have no home near is still worth keeping for the team.
  const pincodePlace = isFullPincode(q) && shownPlaces.length === 0 ? `Pincode ${q}` : null;

  async function submit() {
    if (!contact) {
      goTo("you");
      return;
    }
    save(step, answers);
    setStatus("sending");
    await contactSaved.current;
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contact,
          id: idFor(),
          zohoRef: zohoRef.current,
          form: "find-my-home",
          source: answers.source,
          referralCode: answers.referralCode,
          gender: answers.gender,
          property: answers.property,
          stay: answers.stay,
          visitDay: answers.visitDay,
          visitWindow: answers.visitWindow,
          visitType: answers.visitType,
          moveIn: answers.moveIn,
          budget: answers.budget?.label,
          room: answers.room ? (answers.room === "unsure" ? "Not sure yet" : roomKindLabels[answers.room]) : undefined,
          places: answers.places,
          attribution: readAttribution(),
          page: window.location.pathname + window.location.search,
          elapsedMs: since(startedAt.current),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        const p = getProperty(answers.property ?? "");
        track("generate_lead", { form: "find-my-home", property: p?.code, source: answers.source });
        setDone({ name: contact.firstName, phone: contact.phone, testMode: body.mode === "test" });
        setStatus("done");
        window.scrollTo({ top: 0 });
        return;
      }
      if (body.errors) {
        const errs = body.errors as LeadErrors;
        setErrors(errs);
        setStatus("idle");
        if (errs.firstName || errs.lastName || errs.phone || errs.email) goTo("you");
        else if (errs.source) goTo("heard");
        else if (errs.gender) goTo("who");
        else if (errs.property) goTo("home");
        return;
      }
      setMessage(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  const exitHref = startProperty ? `/properties/${startProperty}` : "/";
  const chosen = getProperty(answers.property ?? "");
  const visit = answers.visitDay ? visitLabel(answers.visitDay, answers.visitWindow, answers.visitType) : undefined;

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,44%)]">
      <div className="flex min-h-dvh flex-col">
        {/* Top bar */}
        <div className="flex h-[72px] items-center justify-between px-5 md:px-10">
          {status !== "done" && index > 0 ? (
            <button type="button" onClick={back} aria-label="Previous question" className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink hover:bg-mist">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link href="/" aria-label="FF21 Coliving, home" className="flex items-center gap-2">
              <Image src="/brand/ff21-logo-192.png" alt="" width={40} height={40} className="h-10 w-10" />
            </Link>
          )}
          <Link href={exitHref} aria-label="Close and go back" className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink hover:bg-mist">
            <X className="h-5 w-5" />
          </Link>
        </div>

        {/* Taps inside the form aren't logged (the steps are, as events): its buttons can show what the visitor typed. */}
        <div data-notrack className="mx-auto w-full max-w-[660px] flex-1 px-5 pb-36 pt-4 md:px-10 md:pt-8">
          {status === "done" && done ? (
            <div className="rise" role="status">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-blue text-on-blue">
                <Check className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <h1 ref={heading} tabIndex={-1} className="mt-6 text-[34px] font-extrabold leading-[40px] tracking-[-0.025em] text-ink focus:outline-none md:text-[44px] md:leading-[50px]">
                You&apos;re all set, {done.name}.
              </h1>
              <p className="mt-3 text-[17px] leading-[27px] text-ink-2">
                {visit
                  ? `Our team will confirm your ${answers.visitType === "Virtual" ? "video tour" : "visit"}${chosen ? ` of FF21 ${chosen.code}` : ""} for ${visitLabel(answers.visitDay!, answers.visitWindow)} by WhatsApp or a call on ${done.phone}.`
                  : `Our team will call you on ${done.phone} to set up your visit${chosen ? ` to FF21 ${chosen.code}` : ""}. Visits ${site.visitHours}.`}
              </p>
              <dl className="mt-8 divide-y divide-line rounded-lg border border-line">
                {[
                  ["Home", chosen ? `FF21 ${chosen.code} · ${chosen.area}` : undefined],
                  ["Visit", visit],
                  ["Move in", answers.moveIn],
                  ["Stay", answers.stay],
                  ["Budget", answers.budget?.label],
                  ["Room", answers.room ? (answers.room === "unsure" ? "Not sure yet" : roomKindLabels[answers.room]) : undefined],
                  ["Near", answers.places.join(", ") || undefined],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 px-5 py-3.5 text-[15px]">
                      <dt className="text-ink-2">{k}</dt>
                      <dd className="text-right font-medium text-ink">{v}</dd>
                    </div>
                  ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <TrackedLink event="whatsapp_click" params={{ placement: "find_home_done" }} href={whatsappLink(`Hi FF21! I just used Find my home on your website. I'm ${done.name}.`)} className={button.primary}>
                  WhatsApp us now
                </TrackedLink>
                <Link href="/properties" className={button.secondary}>
                  Keep exploring homes
                </Link>
              </div>
              {done.testMode && (
                <p className="mt-8 rounded-md bg-sun/35 px-4 py-3 text-[14px] text-ink">Test mode: these answers were checked and logged, but not sent to Zoho.</p>
              )}
            </div>
          ) : (
            <>
              {/* Progress: encouragement and a bar that starts a little way in,
                  never a count of steps still to go (Madhvik, 28 Oct 2026:
                  "9 steps left" put people off; speed and motivation first). */}
              <p className="text-[15px] font-semibold text-blue-ink">{cheer(index)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <div className="h-full rounded-full bg-blue-ink transition-[width] duration-500 ease-[var(--ease-standard)]" style={{ width: `${progressOf(index)}%` }} />
              </div>

              <div key={step} className="rise">
                <h1 ref={heading} tabIndex={-1} className="mt-10 text-[30px] font-bold leading-[36px] tracking-[-0.02em] text-ink focus:outline-none md:text-[36px] md:leading-[42px]">
                  {copy[step].title}
                </h1>
                <p className="mt-2 text-[16px] leading-[25px] text-ink-2">{copy[step].lead}</p>
                <div className="mt-8 border-t border-line pt-8">
                  {step === "where" && (
                    <div>
                      <label htmlFor="place-search" className="sr-only">
                        Search areas, tech parks, colleges or pincodes
                      </label>
                      <div className="relative">
                        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" />
                        <input
                          id="place-search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search an area, tech park, college or pincode"
                          autoComplete="off"
                          className="h-13 w-full rounded-lg border border-line-strong bg-surface py-3.5 pl-12 pr-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-blue-ink focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      {answers.places.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Chosen places">
                          {answers.places.map((pl) => (
                            <li key={pl}>
                              <button type="button" onClick={() => togglePlace(pl)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-ink pl-4 pr-3 text-[14px] font-semibold text-white">
                                {pl}
                                <X aria-label={`Remove ${pl}`} className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {!q && (
                        <>
                          <p className="mt-6 text-[14px] font-semibold text-ink-2">Areas we&apos;re in</p>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {areaNames.map((a) => {
                              const on = answers.places.includes(a);
                              const count = homesNear(a).length;
                              return (
                                <li key={a}>
                                  <button
                                    type="button"
                                    aria-pressed={on}
                                    onClick={() => togglePlace(a)}
                                    className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-[border-color,background-color] ${on ? optionOn : optionOff}`}
                                  >
                                    {a}
                                    <span className={`text-[13px] font-normal ${on ? "text-ink-2" : "text-ink-3"}`}>
                                      {count} {count === 1 ? "home" : "homes"}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                      <p className="mt-6 text-[14px] font-semibold text-ink-2">{q ? "Matches" : "Tech parks and places nearby"}</p>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {shownPlaces.map((pl) => {
                          const on = answers.places.includes(pl);
                          const count = homesNear(pl).length;
                          return (
                            <li key={pl}>
                              <button type="button" aria-pressed={on} onClick={() => togglePlace(pl)} className={`${option} ${on ? optionOn : optionOff}`}>
                                <span>
                                  <span className="block">{pl}</span>
                                  <span className="block text-[13px] font-normal text-ink-3">
                                    {isCollege(pl) ? "College · " : pincodes[pl] ? `${pincodes[pl]} · ` : ""}
                                    {count} {count === 1 ? "home" : "homes"} close by
                                  </span>
                                </span>
                                <Tick on={on} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {pincodePlace && (
                        <button
                          type="button"
                          onClick={() => {
                            togglePlace(pincodePlace);
                            setQuery("");
                          }}
                          className={`${option} ${optionOff}`}
                        >
                          <span className="flex items-center gap-3">
                            <MapPin aria-hidden className="h-5 w-5 text-blue-ink" />
                            <span>
                              <span className="block">Add pincode {q}</span>
                              <span className="block text-[13px] font-normal text-ink-3">No home listed there yet. We&apos;ll suggest the nearest ones.</span>
                            </span>
                          </span>
                          <Plus aria-hidden className="h-5 w-5 text-ink-3" />
                        </button>
                      )}
                      {q && shownPlaces.length === 0 && !pincodePlace && (
                        <p className="mt-2 text-[15px] text-ink-2">No matches. Try the nearest area, tech park or a 6-digit pincode, or skip this question.</p>
                      )}
                    </div>
                  )}

                  {step === "movein" && (
                    <ul className="grid gap-2">
                      {moveIns.map((m) => (
                        <li key={m}>
                          <button type="button" onClick={() => chooseAndNext({ moveIn: m })} className={`${option} ${answers.moveIn === m ? optionOn : optionOff}`}>
                            {m}
                            <Tick on={answers.moveIn === m} />
                          </button>
                        </li>
                      ))}
                      <li>
                        {pickDate ? (
                          <label className="block rounded-lg border border-line-soft px-5 py-4">
                            <span className={label}>Move-in date</span>
                            <input
                              type="date"
                              className={field}
                              onChange={(e) => {
                                const d = e.target.valueAsDate;
                                if (d) update({ moveIn: `On ${d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}` });
                              }}
                            />
                          </label>
                        ) : (
                          <button type="button" onClick={() => setPickDate(true)} className={`${option} ${optionOff}`}>
                            Pick a date
                            <span className="text-[14px] font-normal text-ink-3">Calendar</span>
                          </button>
                        )}
                      </li>
                    </ul>
                  )}

                  {step === "stay" && (
                    <ul className="grid gap-2">
                      {stays.map((s) => (
                        <li key={s}>
                          <button type="button" onClick={() => chooseAndNext({ stay: s })} className={`${option} ${answers.stay === s ? optionOn : optionOff}`}>
                            {s === "1 year and more" ? "A year or more" : s}
                            <Tick on={answers.stay === s} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {step === "budget" && (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {budgets.map((b) => (
                        <li key={b.label}>
                          <button type="button" onClick={() => chooseAndNext({ budget: b })} className={`${option} h-full ${answers.budget?.label === b.label ? optionOn : optionOff}`}>
                            <span className="tabular">{b.label}</span>
                            <Tick on={answers.budget?.label === b.label} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {step === "room" && (
                    <ul className="grid grid-cols-2 gap-3">
                      {roomChoices.map((r) => {
                        const on = answers.room === r.id;
                        return (
                          <li key={r.id}>
                            <button type="button" onClick={() => chooseAndNext({ room: r.id })} className={`flex h-full w-full flex-col overflow-hidden rounded-lg border text-left transition-[border-color,box-shadow] ${on ? optionOn : optionOff}`}>
                              {r.photo ? (
                                <span className="relative block aspect-[4/3] w-full bg-mist">
                                  <Image src={r.photo.id} alt="" fill sizes="(min-width: 640px) 280px, 45vw" className="object-cover" />
                                </span>
                              ) : (
                                <span className="grid aspect-[4/3] w-full place-items-center bg-mist text-[40px] font-bold text-blue-ink">?</span>
                              )}
                              <span className="flex items-start justify-between gap-3 p-4">
                                <span>
                                  <span className="block text-[16px] font-semibold text-ink">{r.title}</span>
                                  <span className="block text-[14px] font-normal text-ink-2">{r.body}</span>
                                </span>
                                <Tick on={on} />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {step === "home" && (
                    <ul className="grid gap-3">
                      {ranked.map(({ p, reasons }, i) => {
                        const on = answers.property === p.slug;
                        const from = fromPrice(p);
                        return (
                          <li key={p.slug}>
                            <button type="button" aria-pressed={on} onClick={() => update({ property: p.slug })} className={`flex w-full items-center gap-4 rounded-lg border p-3 pr-5 text-left transition-[border-color,box-shadow] ${on ? optionOn : optionOff}`}>
                              <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-mist">
                                <Image src={p.hero.id} alt="" fill sizes="96px" className="object-cover" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="truncate text-[16px] font-semibold text-ink">{p.area}</span>
                                  {i === 0 && reasons.length > 0 && <span className="shrink-0 rounded-full bg-sun px-2 py-0.5 text-[12px] font-bold text-ink">Best match</span>}
                                </span>
                                <span className="block truncate text-[14px] text-ink-2">
                                  FF21 {p.code} · {from ? `from ${inr(from)}` : "prices on request"}
                                </span>
                                {reasons.length > 0 && <span className="mt-1 block truncate text-[13px] font-medium text-blue-ink">{reasons.join(" · ")}</span>}
                              </span>
                              <Tick on={on} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {step === "visit" && (
                    <VisitPicker answers={answers} onChange={update} />
                  )}

                  {step === "heard" && (
                    <div>
                      <ul className="grid gap-2 sm:grid-cols-2" aria-label="How you heard of us">
                        {sourceChoices.map((c) => {
                          const on = answers.source === c.id;
                          return (
                            <li key={c.id}>
                              <button type="button" aria-pressed={on} onClick={() => update({ source: c.id })} className={`${option} ${on ? optionOn : optionOff}`}>
                                <span className="flex items-center gap-3">
                                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${on ? "bg-blue text-on-blue" : "bg-mist text-ink"}`}>
                                    <c.icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={2} />
                                  </span>
                                  {c.label}
                                </span>
                                <Tick on={on} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {errors.source && <FieldError message={errors.source} />}
                      <div className="mt-8">
                        <TextField
                          name="referralCode"
                          label="Referral code"
                          optional
                          autoComplete="off"
                          placeholder="From a friend at FF21"
                          defaultValue={answers.referralCode}
                          onValue={(v) => update({ referralCode: v.trim() || undefined })}
                        />
                      </div>
                    </div>
                  )}

                  {(step === "home" || step === "heard") && message && (
                    <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 text-[15px] text-danger">
                      {message}
                    </p>
                  )}

                  {step === "who" && (
                    <ul className="grid gap-2 sm:grid-cols-3">
                      {genders.map((g) => (
                        <li key={g}>
                          <button type="button" onClick={() => chooseAndNext({ gender: g })} className={`${option} ${answers.gender === g ? optionOn : optionOff}`}>
                            {g === "Couple" ? "A couple" : g === "Female" ? "A woman" : "A man"}
                            <Tick on={answers.gender === g} />
                          </button>
                        </li>
                      ))}
                      {errors.gender && <li className="text-[14px] text-danger">{errors.gender}</li>}
                    </ul>
                  )}

                  {step === "you" && (
                    <form id="contact" onSubmit={submitContact} noValidate className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <TextField name="firstName" label="First name" autoComplete="given-name" defaultValue={contact?.firstName} error={errors.firstName} onCheck={setFieldError} />
                        <TextField name="lastName" label="Last name" autoComplete="family-name" defaultValue={contact?.lastName} error={errors.lastName} onCheck={setFieldError} />
                      </div>
                      <TextField
                        name="phone"
                        label="Mobile number"
                        hint="We'll call or WhatsApp you on this number."
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder="98765 43210"
                        prefix="+91"
                        defaultValue={contact?.phone?.replace(/^\+91/, "")}
                        error={errors.phone}
                        onCheck={setFieldError}
                      />
                      <TextField name="email" label="Email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" defaultValue={contact?.email} error={errors.email} onCheck={setFieldError} />
                      {/* Hidden from people; bots fill it in. */}
                      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
                        <label htmlFor="website">Website</label>
                        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                      </div>
                      <p className="text-[14px] leading-[22px] text-ink-3">
                        By continuing you agree to our{" "}
                        <Link href="/privacypolicy" className="font-semibold text-blue-ink transition-colors hover:text-ink">privacy policy</Link> and{" "}
                        <Link href="/terms-and-conditions" className="font-semibold text-blue-ink transition-colors hover:text-ink">terms</Link>, including calls and WhatsApp messages about your stay.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom bar */}
        {status !== "done" && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur md:px-10 lg:right-[44%]">
            <div className="mx-auto flex max-w-[580px] items-center justify-between gap-4">
              {step === "you" ? (
                <>
                  <span className="text-[14px] text-ink-3">Your answers save as you go</span>
                  <button type="submit" form="contact" className={button.primary}>
                    Continue
                  </button>
                </>
              ) : step === "heard" ? (
                <>
                  <span className="truncate text-[14px] text-ink-3">{chosen ? `Visit to FF21 ${chosen.code}` : ""}</span>
                  <button type="button" onClick={submit} disabled={status === "sending" || !answers.source} className={button.primary}>
                    {status === "sending" ? "Sending…" : "Book now"}
                  </button>
                </>
              ) : (
                <>
                  {step === "where" || step === "movein" || step === "budget" || step === "room" || step === "visit" ? (
                    <button type="button" onClick={next} className="rounded-full px-4 py-2.5 text-[15px] font-semibold text-ink transition-colors hover:bg-mist">
                      Skip for now
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="button" onClick={next} disabled={(step === "who" && !answers.gender) || (step === "home" && !answers.property) || (step === "visit" && Boolean(answers.visitDay) && !answers.visitWindow)} className={button.primary}>
                    Continue
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* The photo panel follows the conversation */}
      <div className="sticky top-0 hidden h-dvh p-4 lg:block">
        <div className="relative h-full overflow-hidden rounded-xl bg-mist">
          <div key={photo.id} className="fade-in absolute inset-0">
            <Image src={photo.id} alt="" fill sizes="150vh" quality={90} className="object-cover" />
          </div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgb(15_30_32/0.55)] via-transparent to-transparent" />
          <p className="absolute bottom-8 left-8 right-8 text-[22px] font-semibold leading-[30px] text-white">
            {(step === "home" || step === "visit") && chosen ? `FF21 ${chosen.code} · ${chosen.area}` : "Where friends become family."}
          </p>
        </div>
      </div>
    </div>
  );
}
