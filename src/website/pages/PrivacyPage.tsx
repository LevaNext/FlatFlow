/**
 * Standalone Privacy Policy page. Uses shared layout and PrivacyContent component.
 */
import { PrivacyContent } from "@/website/components/privacy";

export function PrivacyPage() {
  return (
    <main className="content relative px-4 py-12 sm:px-6 sm:py-16" id="privacy">
      <PrivacyContent />
    </main>
  );
}
