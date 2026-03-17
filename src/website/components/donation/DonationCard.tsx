import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanding } from "../../context/LandingContext";

export function DonationCard() {
  const { t } = useLanding();

  return (
    <motion.div
      className="mx-auto max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 bg-card/80 text-center shadow-lg">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {t.donation.title}
          </h1>
        </CardHeader>
        <CardContent className="pb-10">
          <p className="text-lg font-medium text-muted-foreground">
            {t.donation.soon}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
