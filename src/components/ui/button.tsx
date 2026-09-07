import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "ghost"
  children: ReactNode
}

export function Button({ variant = "default", className, children, ...props }: ButtonProps) {
  return <button className={cn("btn", variant !== "default" && variant, className)} {...props}>{children}</button>
}
