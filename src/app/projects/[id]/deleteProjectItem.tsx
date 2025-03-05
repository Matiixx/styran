"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";

import { api } from "~/trpc/react";

type DeleteProjectItemProps = {
  openDialog: () => void;
};

const DeleteProjectItem = ({ openDialog }: DeleteProjectItemProps) => {
  return (
    <DropdownMenuItem
      variant="destructive"
      className="font-bold"
      onClick={openDialog}
    >
      Delete
    </DropdownMenuItem>
  );
};

const DeleteProjectDialog = ({
  id,
  isOpen,
  closeDialog,
}: {
  id: string;
  isOpen: boolean;
  closeDialog: () => void;
}) => {
  const router = useRouter();
  const utils = api.useUtils();
  const { mutateAsync: deleteProject } = api.projects.deleteProject.useMutation(
    {
      onSuccess: () => {
        toast("Project deleted");
        void utils.projects.getProjects.invalidate();
        router.replace("/projects");
      },
      onError: () => {
        toast.error("Error while deleting project");
      },
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Do you want to delete this project?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            project and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => deleteProject({ id })}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteProjectItem, DeleteProjectDialog };
