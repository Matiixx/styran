"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { Drawer } from "~/components/ui/drawer";

import TaskDrawerContent from "./taskDrawerContent";

type TaskDrawerProps = {
  taskId: string;
  projectId: string;
};

const TaskDrawer = ({ taskId, projectId }: TaskDrawerProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [task] = api.tasks.getTask.useSuspenseQuery({ taskId, projectId });

  if (!task) {
    return null;
  }

  const closeDrawer = () => {
    setOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
    }
  };

  const onAnimationEnd = () => {
    router.push(`/projects/${projectId}/backlog`);
  };

  return (
    <Drawer
      open={open}
      direction="right"
      onOpenChange={handleOpenChange}
      onAnimationEnd={onAnimationEnd}
    >
      <TaskDrawerContent task={task} closeDrawer={closeDrawer} />
    </Drawer>
  );
};

export default TaskDrawer;
