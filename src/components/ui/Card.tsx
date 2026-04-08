import { motion } from "motion/react";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, boxShadow: "0 12px 48px rgba(0,102,204,0.15)" } : undefined}
      className={`bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}
