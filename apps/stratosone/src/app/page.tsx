import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { ProductsShowcase } from "@/components/ProductsShowcase";
import { ContactSection } from "@/components/ContactSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection
        name="Stratos One"
        title="We build and launch digital products — from MVPs to scalable platforms."
        subtitle="Stratos One is a product studio designing, building, and shipping real products end-to-end. Engage the studio for full builds, or work directly with the founder when senior hands-on execution is required."
        highlight="Product studio led by the founder"
        primaryCtaLabel="Start a Stratos One project"
        primaryCtaHref="/contact"
        secondaryCtaLabel="Explore founder-led engagement"
        secondaryCtaHref="/founder-led"
      />
      <ServicesSection />
      <ProductsShowcase />
      <ContactSection
        email="hello@stratos.one"
        twitter="https://twitter.com/stratosone"
        linkedin="https://linkedin.com/company/stratosone"
        github="https://github.com/stratosone"
        location="Europe"
        timezone="CET (GMT+1)"
      />
    </main>
  );
}
