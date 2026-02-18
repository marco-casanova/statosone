"use client";
import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
// Removed usePathname for locale to avoid any SSR/client divergence
import s from "./landing.module.css";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

function VideoBackground() {
  const videos = ["/v1.mp4", "/v2.mp4", "/v3.mp4"];
  const [idx, setIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Let the browser handle source swapping; just try to play and ignore
    // expected interruptions when a new source is loaded quickly.
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((err: unknown) => {
        if (
          !(err instanceof DOMException && err.name === "AbortError") &&
          !(typeof err === "object" &&
            err !== null &&
            "name" in err &&
            (err as { name?: string }).name === "AbortError")
        ) {
          // eslint-disable-next-line no-console
          console.error("Video playback failed", err);
        }
      });
    }
  }, [idx]);

  return (
    <div className={s.videoBg}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={s.video}
        onEnded={() => setIdx((i) => (i + 1) % videos.length)}
      >
        <source src={videos[idx]} type="video/mp4" />
      </video>
      <div className={s.overlay} />
    </div>
  );
}

function Brand() {
  return (
    <span
      className={s.brand}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.75)",
        borderRadius: "9999px",
        padding: "6px",
        boxShadow: "0 6px 22px -4px rgba(0,0,0,0.28)",
      }}
    >
      <Image
        src="/krl.png"
        alt="Kin Relay"
        width={80}
        height={80}
        priority
        style={{ width: 80, height: 80, objectFit: "contain" }}
      />
    </span>
  );
}

function LandingTopBar() {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div className={s.topBar}>
      <div className={s.topLeft}>
        <Link
          href={`/${locale}`}
          className={s.topBrand}
          aria-label="Kin Relay home"
        >
          <Image
            src="/krl.png"
            alt="Kin Relay"
            width={80}
            height={80}
            priority
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        </Link>
        <nav className={s.topLinks}>
          <a href="#services">{t("landing.top.services")}</a>
          <a href="#contact">{t("landing.top.contact")}</a>
          <a href="#qa">{t("landing.top.qa")}</a>
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <LanguageSwitcher />
        <Link href={`/${locale}/login`} className={s.topBtn}>
          {t("auth.login")}
        </Link>
        <Link href={`/${locale}/signup`} className={s.topBtn}>
          {t("auth.signup")}
        </Link>
      </div>
    </div>
  );
}

function Hero() {
  const t = useTranslations("landing.hero");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  return (
    <section className={s.hero}>
      <div className={s.heroInner}>
        <Brand />
        <h1 className={s.h1}>{t("title")}</h1>
        <p className={s.lead}>
          {t("lead_line1")}
          <br />
          {t("lead_line2")}
        </p>
        <div
          className={s.heroCtas}
          style={{
            display: "flex",
            gap: "18px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a className={s.ctaBtn} href="#services">
            {t("cta")}
          </a>
          <Link href={`/${locale}/signup`} className={s.ctaBtn}>
            {tAuth("join_now")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProblemsSection() {
  const t = useTranslations("landing.problems");
  const items = [
    "fragmented",
    "missed",
    "burnout",
    "handover",
    "privacy",
    "language",
  ];
  return (
    <section className={s.section} id="problems">
      <h2 className={s.h2}>{t("title")}</h2>
      <p className={s.sectionIntro}>{t("intro")}</p>
      <div className={s.cardsGrid}>
        {items.map((k) => (
          <div key={k} className={s.card}>
            <h3 className={s.cardTitle}>{t(`items.${k}.title`)}</h3>
            <p className={s.cardText}>{t(`items.${k}.text`)}</p>
          </div>
        ))}
      </div>
      <p className={s.sectionOutro}>{t("outro")}</p>
    </section>
  );
}

function Services() {
  const t = useTranslations("landing.services");
  const items = ["web", "android", "admin", "multi", "privacy", "handover"];
  return (
    <section className={s.section} id="services">
      <h2 className={s.h2}>{t("title")}</h2>
      <div className={s.cardsGrid}>
        {items.map((k) => (
          <div key={k} className={s.card}>
            <h3 className={s.cardTitle}>{t(`${k}.title`)}</h3>
            <p className={s.cardText}>{t(`${k}.text`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QASection() {
  const t = useTranslations("landing.qa");
  const items = [
    "what",
    "who",
    "medical",
    "privacy",
    "platforms",
    "export",
    "languages",
    "invite",
    "android",
    "difference",
    "multiple",
    "free",
    "support",
    "accessibility",
    "getting_started",
  ];
  return (
    <section className={s.section} id="qa">
      <h2 className={s.h2}>{t("title")}</h2>
      <div className={s.qaList}>
        {items.map((k) => (
          <details key={k} className={s.qaItem}>
            <summary>{t(`items.${k}.q`)}</summary>
            <p>{t(`items.${k}.a`)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const t = useTranslations("landing.contact");
  const [sent, setSent] = useState("");
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(t("thanks"));
    (e.target as HTMLFormElement).reset();
  }
  return (
    <section className={s.contact} id="contact">
      <h2 className={s.h2}>{t("title")}</h2>
      <form className={s.contactForm} onSubmit={onSubmit}>
        <input
          name="name"
          required
          placeholder={t("name")}
          className={s.input}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={s.input}
        />
        <textarea
          name="message"
          placeholder={t("message")}
          className={s.textarea}
        />
        <button className={s.ctaBtn} type="submit">
          {t("send")}
        </button>
        <span className={s.muted}>{sent}</span>
      </form>
    </section>
  );
}

export default function LandingPage() {
  const locale = useLocale();
  return (
    <div className={s.root} key={locale}>
      <VideoBackground />
      <LandingTopBar />
      <Hero />
      <ProblemsSection />
      <Services />
      <QASection />
      <Contact />
    </div>
  );
}
