"use client";

import type React from "react";

import { useRef, useEffect, useState } from "react";
import { cn } from "~/lib/utils";

interface CollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function Collapse({
  isOpen,
  children,
  className,
  duration = 300,
}: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    isOpen ? undefined : 0,
  );

  useEffect(() => {
    if (!contentRef.current) return;

    const contentHeight = contentRef.current.scrollHeight;

    if (isOpen) {
      const timeout = setTimeout(() => {
        setHeight(undefined);
      }, duration);

      requestAnimationFrame(() => {
        setHeight(contentHeight);
      });

      return () => clearTimeout(timeout);
    } else {
      setHeight(contentRef.current.scrollHeight);

      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [isOpen, duration]);

  return (
    <div
      ref={contentRef}
      className={cn(
        "overflow-hidden transition-[height] ease-in-out",
        className,
      )}
      style={{
        height: height === undefined ? "auto" : `${height}px`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
