"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { cn } from "~/lib/utils";

const EditableInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "onBlur" | "onSubmit"> & {
    onBlur?: (value: string) => void | Promise<void>;
    onSubmit?: (value: string) => void | Promise<void>;
  }
>(({ className, onBlur, onSubmit, ...props }, ref) => {
  const [value, setValue] = useState(props.value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    return onBlur?.(value as string);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditing(false);
    return onSubmit?.(value as string);
  };

  return (
    <>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <Input
            {...props}
            ref={(el) => {
              if (el) {
                inputRef.current = el;
                if (typeof ref === "function") {
                  ref(el);
                } else if (ref) {
                  ref.current = el;
                }
              }
            }}
            value={value}
            className={cn("my-[2px] pl-2", className)}
            onBlur={handleBlur}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        </form>
      ) : (
        <div
          className={cn("cursor-text rounded p-2 hover:bg-gray-100", className)}
          onClick={() => setIsEditing(true)}
        >
          {value}
        </div>
      )}
    </>
  );
});
EditableInput.displayName = "EditableInput";

export { EditableInput };
