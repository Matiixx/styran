import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { type TRPCError } from "@trpc/server";

import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { InputWithLabel } from "~/components/ui/input";

type AddUserToProjectDialogProps = {
  isOpen: boolean;
  projectId: string;
  closeDialog: () => void;
};

const AddUserSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  lastName: z.string().min(1, "Last name is requied"),
  firstName: z.string().min(1, "First name is required"),
});

const defaultValues = {
  email: "",
  lastName: "",
  firstName: "",
};

const AddUserToProjectDialog = ({
  isOpen,
  projectId,
  closeDialog,
}: AddUserToProjectDialogProps) => {
  const {
    formState: { errors },
    reset,
    register,
    setError,
    handleSubmit,
  } = useForm<z.infer<typeof AddUserSchema>>({
    resolver: zodResolver(AddUserSchema),
    defaultValues,
  });

  const utils = api.useUtils();

  const { mutateAsync: addUserToProject } =
    api.projects.addUserToProject.useMutation({
      onSuccess: () => utils.projects.getProject.invalidate({ id: projectId }),
    });

  const onSubmit = handleSubmit((data) => {
    return addUserToProject({ projectId, ...data })
      .then(() => {
        closeDialog();
        reset(defaultValues);
      })
      .catch((res: TRPCError) => {
        setError("root", { message: res.message });
      });
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user to project</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-row gap-4">
            <InputWithLabel
              label="First name"
              placeholder="First name"
              error={!!errors.firstName}
              errorMessage={errors.firstName?.message}
              {...register("firstName")}
            />
            <InputWithLabel
              label="Last name"
              placeholder="Last name"
              error={!!errors.lastName}
              errorMessage={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <InputWithLabel
            label="User email"
            placeholder="User email"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="default" onClick={onSubmit}>
            Add user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddUserToProjectDialog };
