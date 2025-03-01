"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { InputWithLabel } from "~/components/ui/input";
import { INVALID_CREDENTIALS } from "~/lib/errorCodes";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    formState: { errors },
    register,
    setError,
    handleSubmit,
  } = useForm<z.infer<typeof SignInSchema>>({
    mode: "onTouched",
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    return signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
      .then((res) => {
        if (!res?.code) {
          redirect("/");
        }

        if (res?.code === INVALID_CREDENTIALS) {
          setError("password", { message: INVALID_CREDENTIALS });
        } else {
          setError("password", { message: "Something went wrong" });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  });

  return (
    <Card className="w-full max-w-lg" disableHover>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
          <InputWithLabel
            label="Email"
            type="email"
            placeholder="Email"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            disabled={isLoading}
            {...register("email")}
          />

          <InputWithLabel
            label="Password"
            type="password"
            placeholder="Password"
            error={!!errors.password}
            errorMessage={errors.password?.message}
            disabled={isLoading}
            {...register("password")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                return onSubmit();
              }
            }}
          />
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Link href="/api/auth/register">
          <Button variant="outline">Create account</Button>
        </Link>
        <Button onClick={onSubmit} isLoading={isLoading}>
          Login
        </Button>
      </CardFooter>

      <div className="mt-4 flex justify-center">
        <Link href="/api/auth/forget">
          <Button variant="link">Forgot password?</Button>
        </Link>
      </div>
    </Card>
  );
};

export { SignInForm };
