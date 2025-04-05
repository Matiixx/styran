"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

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

const CustomSignInSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
});

const CustomSignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    formState: { errors },
    register,
    setError,
    handleSubmit,
  } = useForm<z.infer<typeof CustomSignInSchema>>({
    mode: "onTouched",
    resolver: zodResolver(CustomSignInSchema),
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    return signIn("credentials", {
      uid: data.uid,
      login: data.login,
      custom: true,
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
            label="UID"
            type="text"
            placeholder="UID"
            error={!!errors.uid}
            errorMessage={errors.uid?.message}
            disabled={isLoading}
            {...register("uid")}
          />

          <InputWithLabel
            label="Login"
            type="text"
            placeholder="Login"
            error={!!errors.login}
            errorMessage={errors.login?.message}
            disabled={isLoading}
            {...register("login")}
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
        <Button onClick={onSubmit} isLoading={isLoading}>
          Login
        </Button>
      </CardFooter>
    </Card>
  );
};

export { CustomSignInForm };
