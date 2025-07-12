"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Drawer } from "~/components/ui/drawer";

import TaskDrawerContent from "./taskDrawerContent";
import { useLiveTask } from "./hooks";

type TaskDrawerProps = {
  userId: string;
  taskId: string;
  projectId: string;
};

const TaskDrawer = ({ userId, taskId, projectId }: TaskDrawerProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const { task, comments, trackTimes } = useLiveTask(projectId, taskId);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      router.push(`/projects/${projectId}/backlog`);
    }, 300);
  }, [router, projectId]);

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
