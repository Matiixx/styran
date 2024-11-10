"use client";

import { signIn } from "next-auth/react";
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
  password: z.string().min(5),
});

const SignInForm = () => {
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
    return signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    }).then((res) => {
      if (res?.code === INVALID_CREDENTIALS) {
        setError("password", { message: INVALID_CREDENTIALS });
      }
    });
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="flex w-full flex-col gap-4">
          <InputWithLabel
            label="Email"
            type="email"
            placeholder="Email"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />

          <InputWithLabel
            label="Password"
            type="password"
            placeholder="Password"
            error={!!errors.password}
            errorMessage={errors.password?.message}
            {...register("password")}
          />
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Link href="/api/auth/register">
          <Button variant="outline">Create account</Button>
        </Link>
        <Button onClick={onSubmit}>Login</Button>
      </CardFooter>
    </Card>
  );
};

export { SignInForm };
