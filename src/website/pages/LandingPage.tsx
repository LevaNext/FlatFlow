/**
 * Modern landing page for FlatFlow Chrome Extension.
 * Georgian (default) / English, dark/light theme. Composed from landing section components.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FeaturesSection,
  HeroSection,
  HomeDonationSection,
  HowItWorksSection,
} from "@/website/components/landing";

export function LandingPage(): React.ReactElement {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#donation") return;
    const el = document.getElementById("donation");
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <HomeDonationSection />
    </>
  );
}
