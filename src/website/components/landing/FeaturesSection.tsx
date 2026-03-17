import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Clock, Copy, Shield, Zap } from "lucide-react";
import { useLanding } from "../../context/LandingContext";
import { SECTION_CONTAINER } from "./constants";

type FeatureItem = {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  cardClass: string;
};

export function FeaturesSection() {
  const { t } = useLanding();

  const items: FeatureItem[] = [
    {
      key: "autoFill",
      icon: Zap,
      title: t.features.autoFill,
      subtitle: t.features.autoFillSub,
      cardClass: "bg-blue-500 text-white shadow-lg dark:bg-blue-600",
    },
    {
      key: "saveTime",
      icon: Clock,
      title: t.features.saveTime,
      subtitle: t.features.saveTimeSub,
      cardClass: "bg-blue-600 text-white shadow-lg dark:bg-blue-700",
    },
    {
      key: "accurateData",
      icon: Copy,
      title: t.features.accurateData,
      subtitle: t.features.accurateDataSub,
      cardClass: "bg-blue-700 text-white shadow-lg dark:bg-blue-800",
    },
    {
      key: "manifestV3",
      icon: Shield,
      title: t.features.manifestV3,
      subtitle: t.features.manifestV3Sub,
      cardClass: "bg-blue-800 text-white shadow-lg dark:bg-blue-900",
    },
  ];

  return (
    <section className="relative py-20" id="features">
      <div className={SECTION_CONTAINER}>
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t.features.title}
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.key} className="flex">
              <motion.div
                className="relative flex h-full w-full flex-col items-center"
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
              >
                <motion.div
                  className={`relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl ${item.cardClass}`}
                  whileHover={{
                    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.25)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute right-4 top-4 flex items-center justify-center text-white opacity-20"
                    aria-hidden
                  >
                    <item.icon
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col justify-center pt-2 text-left">
                    <p className="text-lg font-bold leading-tight">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm font-medium opacity-90">
                      {item.subtitle}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
