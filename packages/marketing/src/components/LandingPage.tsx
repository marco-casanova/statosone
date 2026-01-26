import type { ReactNode } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Testimonials } from "./Testimonials";
import { Pricing } from "./Pricing";
import { CTA } from "./CTA";
import { Footer } from "./Footer";
import type { LandingPageConfig } from "../types";

interface LandingPageProps {
  config: LandingPageConfig;
  children?: ReactNode;
}

/**
 * Complete landing page composed from config
 * Apps configure, never reimplement
 */
export function LandingPage({ config, children }: LandingPageProps) {
  return (
    <div className="stratos-landing">
      <Header
        brand={config.brand}
        navigation={config.navigation}
      />

      <main>
        <Hero {...config.hero} />

        {config.features && <Features {...config.features} />}

        {config.testimonials && <Testimonials {...config.testimonials} />}

        {config.pricing && <Pricing {...config.pricing} />}

        {children}

        {config.cta && <CTA {...config.cta} />}
      </main>

      <Footer {...config.footer} />
    </div>
  );
}
