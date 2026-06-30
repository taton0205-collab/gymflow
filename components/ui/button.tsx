import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background shadow-hairline hover:opacity-[0.92]",
        secondary: "border bg-card/70 text-foreground shadow-hairline hover:bg-muted/70",
        ghost: "hover:bg-muted/70",
        outline: "border bg-background/70 shadow-hairline hover:bg-muted/70"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        icon: "h-9 w-9 px-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));

Button.displayName = "Button";
