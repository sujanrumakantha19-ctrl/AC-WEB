import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, trailing, type = "text", required, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-bold text-on-surface-variant">
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <span className="material-symbols-outlined absolute left-3.5 text-outline text-lg select-none pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full py-2.5 px-3.5 rounded-xl bg-white text-on-surface text-xs font-medium placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs",
              icon && "pl-10",
              trailing ? "pr-10" : undefined,
              error && "border-error focus:border-error focus:ring-error",
              className
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute right-2.5 flex items-center">
              {trailing}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-xs">error</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
