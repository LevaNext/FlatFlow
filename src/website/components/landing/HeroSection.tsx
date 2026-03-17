import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanding } from "../../context/LandingContext";
import { AnimatedHeadline } from "./AnimatedHeadline";
import { CHROME_STORE_URL, SECTION_CONTAINER } from "./constants";
import { HeroMockCard } from "./HeroMockCard";

export function HeroSection() {
  const { t } = useLanding();

  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24 md:pt-32">
      <div className={SECTION_CONTAINER}>
        <motion.div
          className="pointer-events-none absolute -left-1/2 top-0 h-[400px] w-[800px] rounded-full bg-gradient-to-br from-primary/8 to-primary/4 blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -right-1/2 top-1/4 h-[300px] w-[600px] rounded-full bg-gradient-to-bl from-primary/6 to-transparent blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.h1
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl md:leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatedHeadline text={t.hero.headline} />
          </motion.h1>
          {t.hero.subtext ? (
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              {t.hero.subtext}
            </motion.p>
          ) : null}
          <motion.div
            className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden
            >
              <motion.div
                className="absolute h-24 w-24 rounded-full border-2 border-primary/30"
                animate={{
                  scale: [1, 1.4, 1.4],
                  opacity: [0.4, 0, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute h-24 w-24 rounded-full border-2 border-primary/25"
                animate={{
                  scale: [1, 1.6, 1.6],
                  opacity: [0.3, 0, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.4,
                }}
              />
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                asChild
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 dark:from-blue-500 dark:to-blue-600"
              >
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <img
                    src="/chrome-icon.png"
                    alt="Chrome"
                    className="h-5 w-5"
                    width={20}
                    height={20}
                  />
                  {t.hero.cta}
                </a>
              </Button>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-2 text-sm font-medium opacity-90"
              >
                {t.hero.soon}
              </Badge>
            </motion.div>
          </motion.div>

          <HeroMockCard mockBadge={t.hero.mockBadge} />
        </div>
      </div>
    </section>
  );
}
