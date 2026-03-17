import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanding } from "../../context/LandingContext";
import { SECTION_CONTAINER } from "./constants";

export function HowItWorksSection() {
  const { t } = useLanding();

  const steps = [
    { step: 1, text: t.howItWorks.step1 },
    { step: 2, text: t.howItWorks.step2 },
    { step: 3, text: t.howItWorks.step3 },
  ];

  return (
    <section className="relative py-20" id="how-it-works">
      <div className={SECTION_CONTAINER}>
        <motion.h2
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {t.howItWorks.title}
        </motion.h2>

        <div className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          <div
            className="absolute left-1/2 top-[72px] hidden h-0.5 w-[calc(100%-12rem)] -translate-x-1/2 overflow-hidden sm:block"
            aria-hidden
          >
            <motion.div
              className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: "left center" }}
            />
          </div>

          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              className="relative flex justify-center"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                className="flex h-full w-full max-w-[280px] flex-col items-center sm:max-w-none"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="relative h-full w-full overflow-hidden border border-border/60 bg-card/80 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 dark:bg-card/90">
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    aria-hidden
                  />
                  <CardHeader className="relative flex flex-col items-center pb-2 pt-8 text-center">
                    <motion.div
                      className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-primary/30"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 20,
                        delay: i * 0.1,
                      }}
                      animate={{
                        boxShadow: [
                          "0 10px 30px -5px rgba(59, 130, 246, 0.35)",
                          "0 16px 40px -5px rgba(59, 130, 246, 0.45)",
                          "0 10px 30px -5px rgba(59, 130, 246, 0.35)",
                        ],
                      }}
                      whileHover={{ scale: 1.1, rotate: 3 }}
                    >
                      {item.step}
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative flex flex-1 flex-col items-center pb-8 pt-0 text-center">
                    <motion.p
                      className="max-w-[220px] text-sm font-medium leading-relaxed text-foreground sm:text-base"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    >
                      {item.text}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
