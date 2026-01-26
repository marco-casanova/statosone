"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import s from "./investors.module.css";

function Brand() {
  return (
    <Link href="#intro" className={s.brand}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={s.brandIcon}
      >
        <path
          d="M4 12c0-4.418 3.582-8 8-8"
          stroke="url(#g1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 12c0 4.418-3.582 8-8 8"
          stroke="url(#g2)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#a78bfa" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <span>Kin Relay</span>
    </Link>
  );
}

function Nav({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <header className={s.nav} role="navigation" aria-label="Primary">
      <div className={`${s.container} ${s.navInner}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Brand />
          <button
            className={s.menuBtn}
            onClick={onToggle}
            aria-expanded={open}
            aria-controls="sidebar"
            aria-label="Toggle menu"
          >
            {open ? "Hide menu" : "Menu"}
          </button>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(media.matches);
  }, []);
  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);
  return (
    <button
      className={s.theme}
      onClick={() => setDark((v) => !v)}
      aria-pressed={dark}
      title="Toggle theme"
    >
      {dark ? "Dark" : "Light"}
    </button>
  );
}

function Hero() {
  return (
    <section className={s.hero}>
      <div className={`${s.container} ${s.grid2}`}>
        <div>
          <p className={s.sub}>
            Daily care logs • One-tap handovers • Non-medical
          </p>
          <h1 className={s.h1}>Care coordination for everyday life</h1>
          <p>
            Log activities, share handover notes, and keep families & carers
            aligned. Built privacy-first, designed for Germany.
          </p>
          <div className={s.cta}>
            <a className={s.btn} href="#calculator">
              Try revenue calculator
            </a>
            <a className={`${s.btn} ${s.btnSecondary}`} href="#features">
              Explore features
            </a>
          </div>
          <div
            className={`${s.heroCard} ${s.reveal}`}
            style={{ marginTop: 18 }}
          >
            <strong>Accessibility</strong>
            <p className={s.muted} style={{ margin: "6px 0 0" }}>
              High-contrast type, fluid typography, and reduced-motion support
              for sensitive users.
            </p>
          </div>
        </div>
        <div className={s.reveal}>
          <div
            className={s.card}
            role="img"
            aria-label="Illustrative dashboard screenshot"
          >
            <h3 className={s.h3}>Handover report preview</h3>
            <p className={s.muted}>
              Shift summary • hydration • meds reminders • incidents
            </p>
            <div className={s.panel} style={{ marginTop: 10 }}>
              <div className={s.kpi}>
                <span>Hydration</span>
                <span className={s.kpiVal}>1.6 L</span>
              </div>
              <div className={s.kpi} style={{ marginTop: 10 }}>
                <span>Meals</span>
                <span className={s.kpiVal}>3 / day</span>
              </div>
              <div className={s.kpi} style={{ marginTop: 10 }}>
                <span>Meds taken</span>
                <span className={s.kpiVal}>On time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2 + " " + s.reveal}>
            What makes Kin Relay different
          </h2>
          <p className={s.muted + " " + s.reveal}>
            Handover-first UX • clear roles • EU privacy • multilingual
          </p>
        </div>
        <div className={s.cards}>
          <div className={s.card + " " + s.reveal}>
            <span className={s.chip}>Non-medical</span>
            <h3 className={s.h3}>Record & remind — not diagnose</h3>
            <p>
              Stay out of medical-device scope: document activities, send
              reminders, share reports. No clinical scoring.
            </p>
          </div>
          <div className={s.card + " " + s.reveal}>
            <span className={s.chip}>Handover</span>
            <h3 className={s.h3}>One-tap shift reports</h3>
            <p>
              Auto-summaries for the next shift or family member: hydration,
              meals, notes, and incidents.
            </p>
          </div>
          <div className={s.card + " " + s.reveal}>
            <span className={s.chip}>Privacy</span>
            <h3 className={s.h3}>Built for Germany</h3>
            <p>
              EU hosting, consent flows, Impressum/Datenschutz patterns, and
              cookie-consent readiness.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2 + " " + s.reveal}>Simple pricing</h2>
          <p className={s.muted + " " + s.reveal}>
            Start free, scale with your needs
          </p>
        </div>
        <div className={s.pricing}>
          <div className={s.price + " " + s.reveal}>
            <h3 className={s.h3}>Free</h3>
            <div className={s.amount}>€0</div>
            <ul className={s.clean}>
              <li>1 care circle</li>
              <li>Basic logs</li>
              <li>Email support</li>
            </ul>
          </div>
          <div className={s.price + " " + s.reveal}>
            <h3 className={s.h3}>Standard (B2C)</h3>
            <div className={s.amount}>€4.99 / mo</div>
            <ul className={s.clean}>
              <li>Unlimited members</li>
              <li>Reminders & exports</li>
              <li>DE/EN interface</li>
            </ul>
          </div>
          <div className={s.price + " " + s.reveal}>
            <h3 className={s.h3}>B2B (Providers)</h3>
            <div className={s.amount}>€0.90–€1.50 pmpm</div>
            <ul className={s.clean}>
              <li>Roster & branches</li>
              <li>CSV/PDF handovers</li>
              <li>Admin dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function euro(x: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(x);
}

function Calculator() {
  const [b2cCount, setB2cCount] = useState(1200);
  const [b2cPrice, setB2cPrice] = useState(5.99);
  const [b2bProv, setB2bProv] = useState(12);
  const [b2bClients, setB2bClients] = useState(120);
  const [b2bRate, setB2bRate] = useState(1.0);

  const b2cMrr = useMemo(() => b2cCount * b2cPrice, [b2cCount, b2cPrice]);
  const b2bMrr = useMemo(
    () => b2bProv * b2bClients * b2bRate,
    [b2bProv, b2bClients, b2bRate]
  );
  const total = b2cMrr + b2bMrr;

  return (
    <section id="calculator" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2 + " " + s.reveal}>Revenue calculator</h2>
          <p className={s.muted + " " + s.reveal}>
            Adjust B2C/B2B assumptions • live MRR
          </p>
        </div>
        <div className={s.calc}>
          <div className={s.panel + " " + s.reveal}>
            <h3 className={s.h3}>B2C</h3>
            <label htmlFor="b2c_count" className={s.label}>
              Paying families (count): <strong>{b2cCount}</strong>
            </label>
            <input
              id="b2c_count"
              className={s.sliderInput}
              type="range"
              min={0}
              max={5000}
              step={1}
              value={b2cCount}
              onChange={(e) => setB2cCount(parseInt(e.target.value || "0"))}
            />
            <div className={s.sliderLabels}>
              <span>0</span>
              <span>5,000</span>
            </div>
            <label htmlFor="b2c_price" className={s.label}>
              Price per month (€): <strong>{b2cPrice.toFixed(2)}</strong>
            </label>
            <input
              id="b2c_price"
              className={s.sliderInput}
              type="range"
              min={0}
              max={20}
              step={0.01}
              value={b2cPrice}
              onChange={(e) => setB2cPrice(parseFloat(e.target.value || "0"))}
            />
            <div className={s.sliderLabels}>
              <span>€0</span>
              <span>€20</span>
            </div>
            <div className={s.kpi} style={{ marginTop: 12 }}>
              <span>B2C MRR</span>
              <span className={s.kpiVal}>{euro(b2cMrr)}</span>
            </div>
          </div>
          <div className={s.panel + " " + s.reveal}>
            <h3 className={s.h3}>B2B</h3>
            <label htmlFor="b2b_prov" className={s.label}>
              Providers (count): <strong>{b2bProv}</strong>
            </label>
            <input
              id="b2b_prov"
              className={s.sliderInput}
              type="range"
              min={0}
              max={100}
              step={1}
              value={b2bProv}
              onChange={(e) => setB2bProv(parseInt(e.target.value || "0"))}
            />
            <div className={s.sliderLabels}>
              <span>0</span>
              <span>100</span>
            </div>
            <label htmlFor="b2b_clients" className={s.label}>
              Clients per provider: <strong>{b2bClients}</strong>
            </label>
            <input
              id="b2b_clients"
              className={s.sliderInput}
              type="range"
              min={0}
              max={500}
              step={1}
              value={b2bClients}
              onChange={(e) => setB2bClients(parseInt(e.target.value || "0"))}
            />
            <div className={s.sliderLabels}>
              <span>0</span>
              <span>500</span>
            </div>
            <label htmlFor="b2b_rate" className={s.label}>
              Rate per client/month (€): <strong>{b2bRate.toFixed(2)}</strong>
            </label>
            <input
              id="b2b_rate"
              className={s.sliderInput}
              type="range"
              min={1}
              max={10}
              step={0.01}
              value={b2bRate}
              onChange={(e) => setB2bRate(parseFloat(e.target.value || "1"))}
            />
            <div className={s.sliderLabels}>
              <span>€1.00</span>
              <span>€10.00</span>
            </div>
            <div className={s.kpi} style={{ marginTop: 12 }}>
              <span>B2B MRR</span>
              <span className={s.kpiVal}>{euro(b2bMrr)}</span>
            </div>
          </div>
        </div>
        <div className={s.panel + " " + s.reveal} style={{ marginTop: 18 }}>
          <div className={s.sum}>
            Total MRR: <span>{euro(total)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section id="intro" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Intro</h2>
        </div>
        <div className={s.cards}>
          <div className={s.card}>
            <h3 className={s.h3}>Product</h3>
            <p>
              A simple web & mobile app that lets family members and
              professional carers log daily activities, handover notes,
              hydration/meal intake, mood, basic symptoms, incidents, and
              medication reminders. It produces one-tap handover reports for the
              next shift/family member.
            </p>
          </div>
          <div className={s.card}>
            <h3 className={s.h3}>Positioning</h3>
            <p>
              “Care coordination for everyday life,” not a medical device. No
              diagnostics, no risk predictions.
            </p>
          </div>
          <div className={s.card}>
            <h3 className={s.h3}>HQ & GTM</h3>
            <p>
              HQ: Munich, Germany. Go-to-market: Germany first (DE+EN), then
              DACH.
            </p>
          </div>
        </div>
        <div className={s.heroCard} style={{ marginTop: 18 }}>
          <strong>Why now</strong>
          <p className={s.muted} style={{ marginTop: 6 }}>
            Germany’s care demand keeps rising: ~5.69 million people were
            care-dependent in 2023, with large shares cared for at home; ~8
            million adults provide informal care. Sources: gws-os.com, PMC.
          </p>
        </div>
      </div>
    </section>
  );
}

function SummarySection() {
  return (
    <section id="summary" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Summary</h2>
        </div>
        <div className={s.grid2} style={{ marginTop: 12 }}>
          <div>
            <h3 className={s.h3}>Customer segments (initial)</h3>
            <ul className={s.clean}>
              <li>
                Families & informal caregivers (B2C) who need an easy shared log
                + reminders.
              </li>
              <li>
                Ambulante Pflegedienste / Betreutes Wohnen / Senior-WGs (B2B)
                who want structured handovers without heavy EHRs.
              </li>
            </ul>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Business model
            </h3>
            <p>
              Freemium → B2C subscription; B2B SaaS priced per cared-for person
              or per scheduled hour.
            </p>
          </div>
          <div>
            <h3 className={s.h3}>Go-to-funding</h3>
            <p>
              Gründungszuschuss (non-repayable) via Agentur für Arbeit with IHK
              viability letter; mentorship via Social Impact Lab & Startup
              Munich.
            </p>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Regulatory stance
            </h3>
            <p>
              Follow MDCG 2019-11 decision tree—avoid medical purpose, keep
              features in “well-being/administrative” lane.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section id="problem" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Problem</h2>
        </div>
        <p style={{ marginTop: 12 }}>
          Families and small care teams juggle WhatsApp threads, paper notes,
          and memory. Handover quality varies; missed meds, duplicate tasks, and
          burnout for informal carers are common themes reported in research and
          press. Germany’s rising care dependency and reliance on home care
          intensify coordination gaps. Sources: PMC, BioMed Central.
        </p>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section id="use-cases" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Use Cases</h2>
        </div>
        <div className={s.cards}>
          <div className={s.card}>
            <h3 className={s.h3}>Family circle</h3>
            <p>
              Daughter logs hydration/meals, sets reminders for meds, grandma’s
              mood, and mobility notes; auto-summary shared nightly.
            </p>
          </div>
          <div className={s.card}>
            <h3 className={s.h3}>Senior-WG</h3>
            <p>
              Early shift records toileting assistance, wound-check note, and a
              fall incident; handover report pushed to late shift + family
              read-only.
            </p>
          </div>
          <div className={s.card}>
            <h3 className={s.h3}>Ambulant service</h3>
            <p>
              Multi-client route; carers complete structured visit notes; office
              exports weekly summaries for audits/invoices (non-medical).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SwotSection() {
  return (
    <section id="swot" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>SWOT</h2>
        </div>
        <div className={s.grid2} style={{ marginTop: 12 }}>
          <div>
            <h3 className={s.h3}>Strengths</h3>
            <ul className={s.clean}>
              <li>Ultra-simple UX; non-medical (low regulatory burden)</li>
              <li>Multilingual; PDF/email handovers</li>
              <li>Privacy-first EU stack</li>
            </ul>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Weaknesses
            </h3>
            <ul className={s.clean}>
              <li>Network effects start small</li>
              <li>Integrations deferred initially</li>
            </ul>
          </div>
          <div>
            <h3 className={s.h3}>Opportunities</h3>
            <ul className={s.clean}>
              <li>Aging population; millions of informal carers</li>
              <li>Agencies adopting lightweight SaaS</li>
              <li>Potential vetted-carer marketplace add-on later</li>
            </ul>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Threats
            </h3>
            <ul className={s.clean}>
              <li>Feature creep into medical territory (MDR)</li>
              <li>Data-protection missteps; entrenched systems</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdvantagesSection() {
  return (
    <section id="advantages" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Advantages / Differentiators</h2>
        </div>
        <ul className={s.clean} style={{ marginTop: 12 }}>
          <li>
            Non-medical by design → faster MVP, no CE-mark (no diagnostics or
            treatment recommendations).
          </li>
          <li>Handover-first UX (one-tap shift report).</li>
          <li>
            B2C ↔ B2B bridge: families start free; agencies adopt when they see
            shared logs.
          </li>
          <li>
            German compliance focus: Impressum/DSGVO/TDDDG patterns built-in.
          </li>
        </ul>
      </div>
    </section>
  );
}

function MarketSizeSection() {
  return (
    <section id="market" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Market Size (Germany, near-term)</h2>
        </div>
        <ul className={s.clean} style={{ marginTop: 12 }}>
          <li>
            5.69 M people in need of care (2023). Majority supported at home.
            Sources: gws-os.com, PMC.
          </li>
          <li>~8 M adult informal caregivers. Source: PMC.</li>
          <li>
            Thousands of ambulante Pflegedienste & Senior-WGs; demand rising
            structurally. Sources: Destatis, PMC.
          </li>
          <li>
            Serviceable Obtainable (Year 1–2): focus on Munich/Bavaria families
            and ~50–100 local providers.
          </li>
        </ul>
      </div>
    </section>
  );
}

function PlatformSection() {
  return (
    <section id="platform" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Platform (MVP)</h2>
        </div>
        <ul className={s.clean} style={{ marginTop: 12 }}>
          <li>
            Web (Next.js) for families and manager dashboard; Android companion
            app for carers.
          </li>
          <li>
            Data: Supabase (EU region), row-level security; encryption at rest;
            least-privilege service role only server-side.
          </li>
          <li>
            Privacy-by-design: explicit consent flows and granular sharing;
            TDDDG-conform CMP; Impressum per §5 DDG.
          </li>
        </ul>
      </div>
    </section>
  );
}

function RevenueModelSection() {
  return (
    <section id="revenue" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Revenue Model</h2>
        </div>
        <ul className={s.clean} style={{ marginTop: 12 }}>
          <li>B2C subscriptions (monthly/annual).</li>
          <li>B2B SaaS (per-person or per-hour).</li>
          <li>
            Add-ons later: white-label for Senior-WGs; export APIs; marketplace
            referral fee (with compliance to platform/consumer law).
          </li>
        </ul>
      </div>
    </section>
  );
}

function LegalComplianceSection() {
  return (
    <section id="legal" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Legal & Compliance (Germany/EU)</h2>
        </div>
        <ul className={s.clean} style={{ marginTop: 12 }}>
          <li>
            Not a medical device at MVP: Avoid medical purpose/claims. No
            interpretation/diagnosis; recording, reminding, communicating only
            (MDCG 2019-11).
          </li>
          <li>
            GDPR: Explicit consent for special-category data; minimization;
            purpose limitation; DPA with processors; EU hosting.
          </li>
          <li>
            Web duties: Impressum under DDG; cookie access under TDDDG + GDPR
            (prior consent for non-essential cookies); avoid dark patterns.
          </li>
          <li>
            Gründungszuschuss path: ALG I + ≥150 days remaining; IHK viability
            letter; apply before major commitments.
          </li>
        </ul>
      </div>
    </section>
  );
}

function RoadmapSection() {
  return (
    <section id="roadmap" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>MVP Roadmap (8 weeks)</h2>
        </div>
        <div className={s.grid2} style={{ marginTop: 12 }}>
          <div>
            <h3 className={s.h3}>Week 1–2 – Core logging & consent</h3>
            <ul className={s.clean}>
              <li>Care circle creation, roles/permissions</li>
              <li>
                Activity types (meals, hydration, meds reminders, incidents,
                notes, photos)
              </li>
              <li>Explicit consent capture + privacy settings</li>
            </ul>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Week 3–4 – Handover & exports
            </h3>
            <ul className={s.clean}>
              <li>One-tap handover report (daily/shift) as PDF/email</li>
              <li>Timeline view + filters; CSV export</li>
            </ul>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Week 5 – Notifications & multilingual
            </h3>
            <ul className={s.clean}>
              <li>Quiet-hour reminders</li>
              <li>DE/EN at launch; later TR/AR/PL/RU/UK/ES</li>
            </ul>
          </div>
          <div>
            <h3 className={s.h3}>Week 6 – B2B basics</h3>
            <ul className={s.clean}>
              <li>Multi-client roster; simple branch view</li>
              <li>Per-client settings</li>
            </ul>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Week 7 – Billing & analytics
            </h3>
            <ul className={s.clean}>
              <li>Stripe monthly plans (B2C) and manual B2B invoicing</li>
              <li>Basic metrics (active circles, entries/day, retention)</li>
            </ul>
            <h3 className={s.h3} style={{ marginTop: 12 }}>
              Week 8 – Compliance polish & launch
            </h3>
            <ul className={s.clean}>
              <li>DDG/TDDDG cookie banner, Impressum/Datenschutz pages</li>
              <li>Accessibility check; invite pilot cohorts in Munich</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ForecastSection() {
  return (
    <section id="forecast" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Forecast (12 months)</h2>
        </div>
        <div className={s.grid2} style={{ marginTop: 12 }}>
          <div>
            <h3 className={s.h3}>Base case</h3>
            <ul className={s.clean}>
              <li>B2C: 1,200 paying families @ €5.99/mo → ~€7.2k MRR</li>
              <li>B2B: 12 providers × 120 clients × €1.00 pmpm → ~€1.4k MRR</li>
              <li>Total MRR ≈ €8.6k; 20–25% MoM growth after month 6</li>
            </ul>
          </div>
          <div>
            <h3 className={s.h3}>Stretch case</h3>
            <ul className={s.clean}>
              <li>B2C: 3,000 paying families @ €5.99 → €18k MRR</li>
              <li>B2B: 25 providers × 180 clients × €1.20 → €5.4k MRR</li>
              <li>
                Total MRR ≈ €23.4k; breakeven likely with lean ops + grants
              </li>
            </ul>
          </div>
        </div>
        <p className={s.muted} style={{ marginTop: 12 }}>
          Assumptions (Germany only): CAC via local groups, clinics’ info
          boards, and Senior-WG partners.
        </p>
      </div>
    </section>
  );
}

function InvestmentSection() {
  return (
    <section id="investment" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Investment & Non-dilutive support</h2>
        </div>
        <div className={s.grid2} style={{ marginTop: 12 }}>
          <div>
            <h3 className={s.h3}>Ask (pre-seed/angel)</h3>
            <p>
              €50–150k to cover 12 months of runway (1–2 FTE dev/design,
              compliance, marketing).
            </p>
          </div>
          <div>
            <h3 className={s.h3}>Non-dilutive</h3>
            <p>
              Gründungszuschuss (ALG I + €300/month for 6 + 9 months) with IHK
              viability letter; Social Impact Lab mentorship/space;
              Startup-in-Munich guidance & referrals.
            </p>
          </div>
        </div>
        <p className={s.muted} style={{ marginTop: 12 }}>
          Next: UnternehmerTUM programs as traction grows.
        </p>
      </div>
    </section>
  );
}

function WhyNonMedicalSection() {
  return (
    <section id="non-medical" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2}>Why this stays “non-medical”</h2>
        </div>
        <ul className={s.clean} style={{ marginTop: 12 }}>
          <li>No analysis, no clinical scoring, no recommendations.</li>
          <li>Reminders & record-keeping only.</li>
          <li>
            Clear disclaimers and escalation guidance (“Call 112 for
            emergencies”).
          </li>
          <li>
            Aligned with MDCG 2019-11: apps with medical purpose or that support
            diagnosis/treatment become medical devices; ours does not.
          </li>
        </ul>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2 + " " + s.reveal}>FAQ</h2>
        </div>
        <div className={s.grid2} style={{ marginTop: 16 }}>
          <div className={s.reveal}>
            <details className={s.details} open>
              <summary className={s.summary}>
                Is Kin Relay a medical device?
              </summary>
              <p>
                No. It’s designed for documentation and reminders only — no
                diagnosis, no treatment recommendations.
              </p>
            </details>
            <details className={s.details}>
              <summary className={s.summary}>
                Does the design consider accessibility?
              </summary>
              <p>
                We target high-contrast text and support “reduced motion”
                preferences. Animations are decorative only.
              </p>
            </details>
          </div>
          <div className={s.reveal}>
            <details className={s.details}>
              <summary className={s.summary}>Is my data private?</summary>
              <p>
                Plan for EU hosting and explicit consent flows. This demo is
                static; production would include proper access control.
              </p>
            </details>
            <details className={s.details}>
              <summary className={s.summary}>Can I try a pilot?</summary>
              <p>
                Yes—contact us with your context (family, Senior-WG, or
                provider). We’ll reach out with next steps.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState<string>("");
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    if (!name || !email) {
      setSent("Please fill your name & email.");
      return;
    }
    setSent("Thanks! We will contact you soon.");
    e.currentTarget.reset();
  }
  return (
    <section id="contact" className={s.section}>
      <div className={s.container}>
        <div className={s.center}>
          <h2 className={s.h2 + " " + s.reveal}>Get in touch</h2>
          <p className={`${s.muted} ${s.reveal} ${s.lead}`}>
            Leave your details — we’ll follow up.
          </p>
        </div>
        <div className={`${s.panel} ${s.contactWrap} ${s.reveal}`}>
          <form className={s.contactForm} onSubmit={onSubmit}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                required
                placeholder="Your name"
                className={s.contactInput}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className={s.contactInput}
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label htmlFor="msg">Message (optional)</label>
              <textarea
                id="msg"
                name="message"
                placeholder="Tell us about your use-case"
                className={s.contactTextarea}
              />
            </div>
            <div className={s.contactActions}>
              <button className={s.btn} type="submit">
                Send
              </button>
              <span className={s.muted} role="status" aria-live="polite">
                {sent}
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function RevealOnScroll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(`.${s.reveal}`));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add(s.show);
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const sY = window.scrollY || document.documentElement.scrollTop;
      ref.current?.classList.toggle(s.toTopShow, sY > 650);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      ref={ref}
      className={s.toTop}
      aria-label="Back to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}

type LinkItem = { href: string; label: string };

export default function InvestorsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    // Close on ESC
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const sidebarItems: LinkItem[] = [
    { href: "#intro", label: "Intro" },
    { href: "#summary", label: "Summary" },
    { href: "#problem", label: "Problem" },
    { href: "#use-cases", label: "Use Cases" },
    { href: "#swot", label: "SWOT" },
    { href: "#advantages", label: "Advantages" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#calculator", label: "Calculator" },
    { href: "#market", label: "Market Size" },
    { href: "#platform", label: "Platform" },
    { href: "#revenue", label: "Revenue" },
    { href: "#legal", label: "Legal" },
    { href: "#roadmap", label: "Roadmap" },
    { href: "#forecast", label: "Forecast" },
    { href: "#investment", label: "Investment" },
    { href: "#non-medical", label: "Non-medical" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];
  const rowSize = Math.ceil(sidebarItems.length / 3);
  const rows: LinkItem[][] = [
    sidebarItems.slice(0, rowSize),
    sidebarItems.slice(rowSize, rowSize * 2),
    sidebarItems.slice(rowSize * 2),
  ];
  return (
    <div className={s.root}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      <Nav open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
      {/* Backdrop */}
      <div
        className={`${s.backdrop} ${menuOpen ? s.backdropShow : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`${s.sidebar} ${menuOpen ? s.sidebarOpen : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Section menu"
      >
        <div className={s.sidebarInner}>
          <div className={s.sidebarHeader}>
            <strong>Sections</strong>
            <button
              className={s.menuBtn}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
          <div className={s.sidebarRows} onClick={() => setMenuOpen(false)}>
            {rows.map((row: LinkItem[], idx: number) => (
              <ul key={idx} className={s.sidebarRow}>
                {row.map((it: LinkItem) => (
                  <li key={it.href}>
                    <a className={s.chipLink} href={it.href}>
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </aside>
      <main id="main">
        <Intro />
        <SummarySection />
        <ProblemSection />
        <UseCasesSection />
        <SwotSection />
        <AdvantagesSection />
        <Hero />
        <Features />
        <Pricing />
        <Calculator />
        <MarketSizeSection />
        <PlatformSection />
        <RevenueModelSection />
        <LegalComplianceSection />
        <RoadmapSection />
        <ForecastSection />
        <InvestmentSection />
        <WhyNonMedicalSection />
        <FAQ />
        <Contact />
      </main>
      <BackToTop />
      <footer className={s.footer}>
        <div className={s.container}>
          <p>© {new Date().getFullYear()} Kin Relay • Demo page</p>
          <p className={s.muted}>
            Design notes: high contrast text (aim ≥4.5:1), fluid typography via{" "}
            <code>clamp()</code>, and a “reduced motion” mode if your OS prefers
            less animation.
          </p>
        </div>
      </footer>
      <RevealOnScroll />
    </div>
  );
}
