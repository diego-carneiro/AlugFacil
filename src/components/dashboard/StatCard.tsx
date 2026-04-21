import type { ReactNode } from "react";
import { motion } from "motion/react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "accent" | "neutral";
}

const colorMap = {
  blue: "bg-primary-50 text-primary-500",
  green: "bg-green-50 text-green-500",
  accent: "bg-accent-50 text-accent-500",
  neutral: "bg-neutral-100 text-neutral-500",
};

export default function StatCard({
  icon,
  label,
  value,
  sub,
  color = "blue",
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 12px 48px rgba(0,102,204,0.12)" }}
      className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,102,204,0.08)]"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-display font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </motion.div>
  );
}
