import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { InputWithLabel } from "~/components/ui/input";
import { editProjectSchema } from "~/lib/schemas";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { api } from "~/trpc/react";

type EditProjectDialogProps = {
  isOpen: boolean;
  project: NonNullable<ProjectRouterOutput["getProject"]>;
  closeDialog: () => void;
};

const EditProjectDialog = ({
  isOpen,
  project,
  closeDialog,
}: EditProjectDialogProps) => {
  const utils = api.useUtils();
  const { mutateAsync: editProject } = api.projects.editProject.useMutation({
    onSuccess: () => {
      closeDialog();
      toast("Project updated");
      return utils.projects.getProject.invalidate({ id: project.id });
    },
    onError: () => {
      toast.error("Error updating project");
    },
  });

  const {
    formState: { errors },
    reset,
    register,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(editProjectSchema),
    mode: "onChange",
    defaultValues: { ...project },
  });

  useEffect(() => {
    reset({ ...project });
  }, [project, reset]);

  const onSubmit = handleSubmit((data) => {
    return editProject({
      id: project.id,
      name: data.name,
      ticker: data.ticker ?? undefined,
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4">
          <InputWithLabel
            label="Name"
            placeholder="Name"
            error={!!errors.name}
            errorMessage={errors.name?.message}
            {...register("name")}
          />

          <InputWithLabel
            label="Ticker"
            placeholder="Ticker"
            error={!!errors.ticker}
            errorMessage={errors.ticker?.message}
            {...register("ticker")}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="default" onClick={onSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { EditProjectDialog };
