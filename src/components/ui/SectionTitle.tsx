import { motion } from "motion/react";
import { fadeInUp, viewportConfig } from "../../hooks/useScrollReveal";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = true }: SectionTitleProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className={`mb-12 ${centered ? "text-center" : ""}`}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}
