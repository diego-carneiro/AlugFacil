import { motion } from "motion/react";
import type { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "accent";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const variants = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 shadow-[0_4px_24px_rgba(0,102,204,0.08)] hover:shadow-[0_12px_48px_rgba(0,102,204,0.15)]",
  secondary:
    "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
  outline:
    "border-2 border-accent-300 text-accent-500 hover:bg-accent-50",
  accent:
    "bg-accent-300 text-neutral-900 hover:bg-accent-400",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  href,
  target,
  rel,
  onClick,
}: ButtonProps) {
  return (
    <motion.a
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold transition-colors cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.a>
  );
}
