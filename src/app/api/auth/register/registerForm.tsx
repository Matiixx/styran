"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";

import isEmpty from "lodash/isEmpty";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import { EMAIL_DUPLICATION } from "~/lib/errorCodes";
import { InputWithLabel } from "~/components/ui/input";

const RegisterSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().min(2, "Fill in your first name"),
    lastName: z.string().min(2, "Fill in your last name"),
    password: z.string().min(5),
    repeatPassword: z.string().min(5),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

export const RegisterForm = () => {
  const { mutateAsync: registerUser } = api.user.register.useMutation({
    onSuccess: () => {
      toast("User registered");
    },
    onError: (error) => {
      if (error.message === EMAIL_DUPLICATION) {
        return toast.error("Email already in use");
      }
      toast.error("Error registering user");
    },
  });

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<z.infer<typeof RegisterSchema>>({
    mode: "onTouched",
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = handleSubmit((data) => registerUser(data));

  return (
    <Card className="w-full max-w-lg" disableHover>
      <CardHeader>
        <CardTitle>Register</CardTitle>
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

          <div className="flex flex-row items-start justify-between gap-4">
            <InputWithLabel
              label="First Name"
              placeholder="First Name"
              error={!!errors.firstName}
              errorMessage={errors.firstName?.message}
              {...register("firstName")}
            />

            <InputWithLabel
              label="Last Name"
              placeholder="Last Name"
              error={!!errors.lastName}
              errorMessage={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <div className="flex flex-row items-start justify-between gap-4">
            <InputWithLabel
              label="Password"
              type="password"
              placeholder="Password"
              error={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
            />

            <InputWithLabel
              label="Repeat Password"
              type="password"
              placeholder="Repeat Password"
              error={!!errors.repeatPassword}
              errorMessage={errors.repeatPassword?.message}
              {...register("repeatPassword")}
            />
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Link href="/api/auth/signin">
          <Button variant="outline">Go to login</Button>
        </Link>
        <Button disabled={!isEmpty(errors)} onClick={onSubmit}>
          Register
        </Button>
      </CardFooter>
    </Card>
  );
};
