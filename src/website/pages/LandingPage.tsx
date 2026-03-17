/**
 * Modern landing page for FlatFlow Chrome Extension.
 * Georgian (default) / English / Russian, dark/light theme. Composed from landing section components.
 */
import {
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
} from "@/website/components/landing";

export function LandingPage(): React.ReactElement {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </>
  );
}
