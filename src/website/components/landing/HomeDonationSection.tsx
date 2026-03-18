import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import donationQr from "@/assets/donation-kisa-qr.png";
import { Button } from "@/components/ui/button";
import { KISA_DONATE_URL } from "@/shared/constants";
import { useLanding } from "../../context/LandingContext";
import { SECTION_CONTAINER } from "./constants";

export function HomeDonationSection() {
  const { t } = useLanding();

  return (
    <section
      id="donation"
      className="relative scroll-mt-24 py-16 md:py-24"
      aria-labelledby="home-donation-heading"
    >
      <div className={SECTION_CONTAINER}>
        <motion.div
          className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-muted/60 via-background to-primary/[0.06] p-8 shadow-xl sm:rounded-[2rem] sm:p-10 md:p-14 lg:p-16"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.12) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.12) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12 lg:gap-16">
            <div className="space-y-6 text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <span
                  className="hidden h-16 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary/40 sm:block"
                  aria-hidden
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    {t.homeDonation.eyebrow}
                  </p>
                  <h2
                    id="home-donation-heading"
                    className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.25rem] lg:leading-tight"
                  >
                    {t.homeDonation.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {t.homeDonation.body}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a
                    href={KISA_DONATE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t.homeDonation.ctaKisa}
                  </a>
                </Button>
              </div>
            </div>

            <motion.div
              className="flex justify-center md:justify-end"
              initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              <div className="group relative">
                <div
                  className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/5 opacity-70 blur-md transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative rotate-2 rounded-2xl border-2 border-primary/30 bg-card/90 p-4 shadow-2xl backdrop-blur-sm transition-transform duration-300 group-hover:rotate-0 md:-rotate-3 md:group-hover:rotate-0">
                  <img
                    src={donationQr}
                    alt=""
                    width={176}
                    height={176}
                    className="h-40 w-40 rounded-xl sm:h-44 sm:w-44"
                  />
                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t.homeDonation.qrCaption}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
