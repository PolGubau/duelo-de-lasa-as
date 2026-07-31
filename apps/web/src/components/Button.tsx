import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn.ts";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-tomato text-brand-bechamel",
  secondary: "bg-brand-basil text-brand-bechamel",
  danger: "bg-brand-crust text-brand-bechamel",
  ghost: "bg-brand-bechamel text-brand-crust",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "font-display rounded-xl border-3 border-brand-crust shadow-button transition-transform duration-100 active:translate-y-1 active:shadow-button-active",
        size === "sm" ? "px-3 py-1 text-xs" : "px-5 py-2.5 text-base",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
