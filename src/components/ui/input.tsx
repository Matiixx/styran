import * as React from "react";

import { cn } from "~/lib/utils";
import { Label } from "./label";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

type InputWithLabelProps = React.ComponentProps<"input"> & {
  label: string;
  error?: boolean;
  errorMessage?: string;
  description?: string;
};

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ className, label, error, errorMessage, description, ...props }, ref) => {
    return (
      <div className={cn("grid w-full items-center gap-1.5", className)}>
        <Label>{label}</Label>
        <Input
          {...props}
          className={cn(error && "border-destructive")}
          ref={ref}
        />
        {error && <Label className="text-destructive">{errorMessage}</Label>}
        {description && !error && (
          <Label className="text-xs text-muted-foreground">{description}</Label>
        )}
      </div>
    );
  },
);
InputWithLabel.displayName = "InputWithLabel";

type InputProps = React.ComponentProps<"input">;

export { Input, InputWithLabel, type InputProps };
