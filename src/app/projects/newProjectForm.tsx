"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { InputWithLabel } from "~/components/ui/input";
import { newProjectSchema } from "~/lib/schemas";
import { api } from "~/trpc/react";
import { getTimezoneOffset } from "~/utils/timeUtils";

type NewProjectFormProps = {
  setOpen: (open: boolean) => void;
};

const NewProjectForm = ({ setOpen }: NewProjectFormProps) => {
  const utils = api.useUtils();
  const { mutateAsync: addProject } = api.projects.addProject.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast("Project created");
      return utils.projects.getProjects.invalidate();
    },
    onError: () => {
      toast.error("Error creating project");
    },
  });

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<z.infer<typeof newProjectSchema>>({
    resolver: zodResolver(newProjectSchema),
    mode: "onTouched",
  });

  const onSubmit = handleSubmit((data) => {
    const timezone = getTimezoneOffset();
    console.log(timezone);
    return addProject({ ...data, timezone });
  });

  return (
    <form className="my-2 flex w-full flex-col gap-4">
      <InputWithLabel
        label="Project name"
        placeholder="Project name"
        error={!!errors.name}
        errorMessage={errors.name?.message}
        {...register("name")}
      />

      <InputWithLabel
        label="Project ticker"
        placeholder="Project ticker"
        error={!!errors.ticker}
        errorMessage={errors.ticker?.message}
        {...register("ticker")}
      />

      <DialogFooter>
        <Button onClick={onSubmit}>Add</Button>
      </DialogFooter>
    </form>
  );
};

export { NewProjectForm };
