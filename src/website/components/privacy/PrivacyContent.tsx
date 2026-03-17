import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanding } from "../../context/LandingContext";
import { privacySections } from "./privacySections";

export function PrivacyContent() {
  const { t } = useLanding();

  return (
    <motion.article
      className="mx-auto max-w-3xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/50 px-6 pb-6 sm:px-10 sm:pt-10 sm:pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t.privacy.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Last updated: March 2025
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="space-y-10">
            {privacySections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-muted-foreground [&>p]:leading-relaxed">
                  {section.content}
                </div>
                {index < privacySections.length - 1 && (
                  <Separator className="mt-8 bg-border/60" />
                )}
              </motion.section>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}
