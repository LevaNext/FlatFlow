import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type HeroMockCardProps = Readonly<{ mockBadge: string }>;

export function HeroMockCard({ mockBadge }: HeroMockCardProps) {
  return (
    <motion.div
      className="mx-auto mt-16 max-w-5xl"
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 text-card-foreground shadow-2xl shadow-primary/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b border-border/60 bg-muted/30 px-4 py-3">
            <motion.div
              className="h-3 w-3 rounded-full bg-red-500/80"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-3 w-3 rounded-full bg-amber-500/80"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.2,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-3 w-3 rounded-full bg-emerald-500/80"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.4,
                ease: "easeInOut",
              }}
            />
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr,1.2fr]">
              <div className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted/50">
                  <Skeleton className="absolute inset-0 rounded-xl" />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/50 text-muted-foreground">
                      <span className="text-sm">📷 Image</span>
                    </div>
                  </motion.div>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted/50"
                    >
                      <Skeleton className="absolute inset-0 rounded-lg" />
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-muted"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.9 + i * 0.08,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:gap-5">
                <div className="relative min-h-[2.25rem]">
                  <Skeleton className="h-8 w-full max-w-sm rounded-lg" />
                  <motion.div
                    className="absolute inset-0 flex items-center bg-card pr-4"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 1 }}
                  >
                    <span className="text-lg font-semibold text-foreground">
                      3 ოთახიანი ბინა, ვაჟა-ფშაველას გამზ.
                    </span>
                  </motion.div>
                </div>

                <div className="relative min-h-[2rem]">
                  <Skeleton className="h-7 w-28 rounded-lg" />
                  <motion.div
                    className="absolute inset-0 flex items-center bg-card"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 1.25 }}
                  >
                    <span className="text-xl font-bold text-primary">
                      120 000 ₾
                    </span>
                  </motion.div>
                </div>

                <Separator className="bg-border/60" />

                {[
                  { label: "ოთახები", value: "3" },
                  { label: "ფართობი", value: "85 m²" },
                  { label: "მისამართი", value: "ვაჟა-ფშაველას გამზირი" },
                ].map(({ label, value }, i) => (
                  <div key={label} className="relative min-h-[2.5rem]">
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-5 w-20 rounded-md" />
                      <Skeleton className="h-5 flex-1 max-w-[140px] rounded-md" />
                    </div>
                    <motion.div
                      className="absolute inset-0 flex items-center gap-2 bg-card"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 1.45 + i * 0.1,
                      }}
                    >
                      <Label className="shrink-0 text-xs text-muted-foreground">
                        {label}
                      </Label>
                      <span className="truncate text-sm font-medium text-foreground">
                        {value}
                      </span>
                    </motion.div>
                  </div>
                ))}

                <Separator className="bg-border/60" />

                <div className="relative min-h-[4rem]">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full rounded-md" />
                    <Skeleton className="h-3 w-[80%] rounded-md" />
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-card"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.85 }}
                  >
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      შესანიშნავი მდგომარეობა, რემონტი. ლოჯი, პარკინგი.
                      მყიდველის მოტივაცია.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative overflow-hidden border-t border-border/60 bg-primary/10 px-6 py-3 text-center text-sm font-medium text-primary">
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-b-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
              aria-hidden
            />
            <motion.span
              className="relative z-10 inline-block"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 2 }}
            >
              {mockBadge}
            </motion.span>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
