"use client";

import { api } from "~/trpc/react";

export const Test = () => {
  const { mutateAsync } = api.post.createTest.useMutation();

  const handleClick = () => {
    return mutateAsync()
      .then(() => {
        console.log("end loadiung");
      })
      .catch(() => {
        console.log("error");
      });
  };

  return <button onClick={handleClick}>Click me </button>;
};
