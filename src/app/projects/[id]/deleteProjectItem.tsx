"use client";

import { redirect } from "next/navigation";
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
  setIsOpen: (isOpen: boolean) => void;
};

const DeleteProjectItem = ({ setIsOpen }: DeleteProjectItemProps) => {
  return (
    <>
      <DropdownMenuItem
        variant="destructive"
        className="font-bold"
        onClick={() => setIsOpen(true)}
      >
        Delete
      </DropdownMenuItem>
    </>
  );
};

const DeleteProjectDialog = ({
  id,
  isOpen,
  setIsOpen,
}: DeleteProjectItemProps & {
  id: string;
  isOpen: boolean;
}) => {
  const utils = api.useUtils();
  const { mutateAsync: deleteProject } = api.projects.deleteProject.useMutation(
    {
      onSuccess: () => {
        void utils.projects.getProjects.invalidate();
        redirect("/projects");
      },
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Do you want to delete this project?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            project and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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
