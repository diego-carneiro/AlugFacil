import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "outline";
  className?: string;
}

const variants = {
  default: "bg-primary-50 text-primary-600",
  accent: "bg-accent-50 text-accent-600",
  outline: "border border-neutral-200 text-neutral-600",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-accent ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
