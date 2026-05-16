import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export function GlassCard({ className = "", children, ...rest }: Props) {
  return (
    <div
      className={`glass glass-inner-glow relative overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
