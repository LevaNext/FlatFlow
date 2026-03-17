import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useLanding } from "../../context/LandingContext";

export function FaqContent() {
  const { t } = useLanding();

  const items = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl">
      <motion.h1
        className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {t.faq.title}
      </motion.h1>
      <Card className="mt-12 border-border/60 bg-card/80">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border-border/60 px-5 last:border-b-0"
              >
                <AccordionTrigger className="py-4">
                  <span className="flex items-center gap-2 text-left">
                    <HelpCircle className="h-4 w-4 shrink-0 text-primary/80" />
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
