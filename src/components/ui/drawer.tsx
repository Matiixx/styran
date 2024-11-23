"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { Drawer as DrawerPrimitive, type DialogProps } from "vaul";

import { cn } from "~/lib/utils";
import { Button } from "./button";
import { X } from "lucide-react";

type DrawerAdditionalProps = {
  showBar?: boolean;
};

const DrawerContext = React.createContext<
  { direction: DialogProps["direction"] } & DrawerAdditionalProps
>({ direction: undefined });

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> &
  DrawerAdditionalProps) => (
  <DrawerContext.Provider
    value={{ direction: props.direction, showBar: props.showBar }}
  >
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  </DrawerContext.Provider>
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const drawerVariants = cva(
  "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-lg border bg-background",
  {
    variants: {
      direction: {
        top: "",
        bottom: "",
        right:
          "inset-y-0 right-0 w-[500px] left-auto mt-0 rounded-t-none rounded-l-lg",
        left: "inset-y-0 left-0 lg:w-1/3 sm:w-2/3 w-full right-unset mt-0 rounded-t-none rounded-r-lg",
      },
    },
  },
);

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { direction, showBar } = React.useContext(DrawerContext);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(drawerVariants({ direction }), className)}
        {...props}
      >
        {showBar && (
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title> & {
    onClose?: () => void;
  }
>(({ className, children, onClose, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "flex gap-2 text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  >
    {children}
    {onClose && (
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X />
      </Button>
    )}
  </DrawerPrimitive.Title>
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

const DrawerDivider = () => (
  <div className="h-[2px] w-full rounded-full bg-muted" />
);

export {
  Drawer,
  DrawerPortal,
  DrawerDivider,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
