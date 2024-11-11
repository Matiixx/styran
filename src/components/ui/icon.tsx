import { cva, type VariantProps } from "class-variance-authority";
import { type FC, type PropsWithChildren } from "react";

const iconVariants = cva("[&>svg]:w-full [&>svg]:h-full", {
  variants: {
    size: {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-10 h-10",
    },
  },
  defaultVariants: { size: "md" },
});

const Icon: FC<PropsWithChildren<VariantProps<typeof iconVariants>>> = ({
  size,
  children,
}) => {
  return <div className={iconVariants({ size })}>{children}</div>;
};

export { Icon };
