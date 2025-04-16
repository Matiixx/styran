import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";
import { Icons } from "./icons";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        ghostDesctructive:
          "text-destructive hover:text-destructive-hover hover:border-destructive-hover border border-transparent duration-300",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-2 [&_svg]:h-full [&_svg]:w-full",
        iconSm: "h-6 w-6 p-1 [&_svg]:h-full [&_svg]:w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      onClick,
      isLoading,
      fullWidth,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const [localIsLoading, setLocalIsLoading] = React.useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const maybePromise = onClick?.(e);
      if (maybePromise instanceof Promise) {
        setLocalIsLoading(true);
        return maybePromise.finally(() => setLocalIsLoading(false));
      }
    };

    return (
      <Comp
        className={cn(
          (isLoading || localIsLoading) &&
            "relative overflow-hidden text-transparent",
          fullWidth && "w-full",
          buttonVariants({ variant, size, className }),
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
        disabled={props.disabled || isLoading || localIsLoading}
      >
        {(isLoading || localIsLoading) && (
          <Icons.spinner className="absolute flex animate-spin text-gray-400" />
        )}
        {props.children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
