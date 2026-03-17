import { motion } from "framer-motion";

/** Staggered headline: wrap each word for motion */
export function AnimatedHeadline({ text }: Readonly<{ text: string }>) {
  const words = text.split(/\s+/);
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };
  const word = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 120, damping: 18 },
    },
  };
  return (
    <motion.span
      className="inline-block"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((w, i) => (
        <motion.span
          key={words.slice(0, i + 1).join("-")}
          className="inline-block"
          variants={word}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
