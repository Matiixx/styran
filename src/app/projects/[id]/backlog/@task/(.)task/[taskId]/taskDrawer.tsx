"use client";
import { useState, useCallback } from "react";
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

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setOpen(false);
    }
  }, []);

  const onAnimationEnd = useCallback(() => {
    router.push(`/projects/${projectId}/backlog`);
  }, [router, projectId]);

  if (!task) {
    return null;
  }

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
