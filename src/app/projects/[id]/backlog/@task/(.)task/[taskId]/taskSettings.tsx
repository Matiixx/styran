"use client";
import { useState } from "react";

import { EllipsisVertical, Trash } from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type TaskSettingsProps = {
  taskId: string;
  projectId: string;
  closeDrawer: VoidFunction;
};

const TaskSettings = ({
  taskId,
  projectId,
  closeDrawer,
}: TaskSettingsProps) => {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const { mutateAsync: deleteTask } = api.tasks.deleteTask.useMutation({
    onSuccess: () => {
      return utils.tasks.getTasks.invalidate({ projectId });
    },
  });

  const handleDeleteClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    return deleteTask({ taskId })
      .then(() => {
        toast("Task deleted successfully");
        setOpen(false);
        closeDrawer();
      })
      .catch(() => {
        toast.error("Failed to delete task");
      });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDeleteClick}
        >
          <Trash size={8} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskSettings;
