import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`max-w-[1280px] mx-auto px-6 lg:px-20 ${className}`}>
      {children}
    </div>
  );
}
