"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";

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

  const onAnimationEnd = (open: boolean) => {
    if (!open) {
      router.push(`/projects/${projectId}/backlog`);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      onAnimationEnd={onAnimationEnd}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Task Details</DrawerTitle>
          <DrawerDescription>Details for task: </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button onClick={closeDrawer}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskDrawer;
