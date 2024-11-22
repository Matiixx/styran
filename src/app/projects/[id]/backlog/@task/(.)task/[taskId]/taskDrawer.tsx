"use client";

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
  const [task] = api.tasks.getTask.useSuspenseQuery({ taskId, projectId });

  if (!task) {
    return null;
  }

  const closeDrawer = () => {
    router.push(`/projects/cm3g62xo90003vx1yhzgic29d/backlog`);
  };

  return (
    <Drawer open onOpenChange={closeDrawer} direction="right">
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
