import { useState } from "react";

import { type TRPCError } from "@trpc/server";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { InputWithLabel } from "~/components/ui/input";
import { api } from "~/trpc/react";

type AddUserToProjectDialogProps = {
  isOpen: boolean;
  projectId: string;
  closeDialog: () => void;
};

const AddUserToProjectDialog = ({
  isOpen,
  projectId,
  closeDialog,
}: AddUserToProjectDialogProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  const utils = api.useUtils();

  const { mutateAsync: addUserToProject } =
    api.projects.addUserToProject.useMutation({
      onSuccess: () => utils.projects.getProject.invalidate({ id: projectId }),
    });

  const onSubmit = () => {
    setError(undefined);
    return addUserToProject({ projectId, email })
      .then(() => {
        closeDialog();
      })
      .catch((res: TRPCError) => {
        setError(res.message);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user to project</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <InputWithLabel
            label="User email"
            placeholder="User email"
            value={email}
            error={!!error}
            errorMessage={error}
            onChange={(e) => setEmail(e.target.value)}
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
