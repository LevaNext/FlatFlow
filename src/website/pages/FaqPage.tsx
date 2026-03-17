/**
 * Standalone FAQ page. Uses shared layout and FaqContent component.
 */
import { FaqContent } from "@/website/components/faq";

export function FaqPage() {
  return (
    <section className="relative px-4 py-20 sm:px-6" id="faq">
      <FaqContent />
    </section>
  );
}
