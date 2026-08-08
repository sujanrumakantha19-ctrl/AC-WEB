import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-label-md text-label-md rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variants = {
      primary:
        "bg-primary-container text-on-primary shadow-sm hover:translate-y-[-1px] hover:shadow-md",
      secondary:
        "bg-secondary-container/20 text-secondary border border-secondary/30 hover:bg-secondary-container/30",
      outline:
        "border border-outline-variant/60 text-on-surface hover:bg-surface-container-low hover:border-outline",
      ghost:
        "text-on-surface-variant hover:bg-primary-container/10 hover:text-primary",
      danger:
        "bg-error text-on-error hover:bg-error/90 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-md",
      md: "px-5 py-2.5 text-label-md",
      lg: "px-8 py-4 text-base font-semibold rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="material-symbols-outlined animate-spin text-lg mr-2">progress_activity</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
