"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type TRPCError } from "@trpc/server";

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

const RegisterSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2, "Fill in your first name"),
  lastName: z.string().min(2, "Fill in your last name"),
  password: z.string().min(5),
});

export const RegisterForm = () => {
  const { mutateAsync: registerUser } = api.user.register.useMutation();

  const {
    formState: { errors },
    register,
    setError,
    handleSubmit,
  } = useForm<z.infer<typeof RegisterSchema>>({
    mode: "onTouched",
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = handleSubmit((data) =>
    registerUser(data).catch((e: TRPCError) => {
      if (e.message === EMAIL_DUPLICATION) {
        setError("email", { message: EMAIL_DUPLICATION });
      }
    }),
  );

  return (
    <Card>
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
        <Button variant="outline">Go to login</Button>
        <Button disabled={!isEmpty(errors)} onClick={onSubmit}>
          Register
        </Button>
      </CardFooter>
    </Card>
  );
};
