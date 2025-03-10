"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { Drawer } from "~/components/ui/drawer";

import TaskDrawerContent from "./taskDrawerContent";

type TaskDrawerProps = {
  userId: string;
  taskId: string;
  projectId: string;
};

const TaskDrawer = ({ userId, taskId, projectId }: TaskDrawerProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [task] = api.tasks.getTask.useSuspenseQuery({ taskId, projectId });
  const [comments] = api.taskComments.getComments.useSuspenseQuery({
    taskId,
    projectId,
  });
  const [trackTimes] = api.timeTracker.getTimes.useSuspenseQuery({ taskId });

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
      handleOnly
      onOpenChange={handleOpenChange}
      onAnimationEnd={onAnimationEnd}
    >
      <TaskDrawerContent
        task={task}
        userId={userId}
        comments={comments}
        trackTimes={trackTimes}
        closeDrawer={closeDrawer}
      />
    </Drawer>
  );
};

export default TaskDrawer;
