import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import noop from "lodash/noop";

import { api } from "~/trpc/react";

import { Badge } from "~/components/ui/badge";
import {
  DrawerContent,
  DrawerDivider,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { EditableInput } from "~/components/ui/editableInput";

import { TaskStatusSelect } from "~/app/projects/[id]/backlog/tasksList";
import AsigneeSelect from "./asigneeSelect";
import TaskDescription from "./taskDescription";
import TaskStoryPoints from "./taskStorypoints";

type TaskDrawerContentProps = {
  task: NonNullable<TasksRouterOutput["getTask"]>;
  closeDrawer: () => void;
};

export default function TaskDrawerContent({
  task,
  closeDrawer,
}: TaskDrawerContentProps) {
  const utils = api.useUtils();
  const { mutateAsync: updateTask, isPending: isUpdating } =
    api.tasks.updateTask.useMutation({
      onSuccess: () =>
        Promise.all([
          utils.tasks.getTasks.invalidate({ projectId: task.projectId }),
          utils.tasks.getTask.invalidate({
            taskId: task.id,
            projectId: task.projectId,
          }),
        ]),
    });

  const saveTitle = (value: string) => {
    return updateTask({
      taskId: task.id,
      projectId: task.projectId,
      title: value,
    }).then(noop);
  };

  const saveStoryPoints = (value: number | null) => {
    return updateTask({
      taskId: task.id,
      projectId: task.projectId,
      storyPoints: value,
    }).then(noop);
  };

  return (
    <DrawerContent>
      <DrawerHeader className="gap-4">
        <DrawerTitle className="" onClose={closeDrawer}>
          <div className="flex w-full flex-col">
            <div className="flex flex-1 items-center gap-2">
              <Badge className="text-nowrap">{task.ticker}</Badge>
              <EditableInput
                value={task.title}
                className="flex-1 text-lg md:text-lg"
                onBlur={saveTitle}
                onSubmit={saveTitle}
              />
            </div>
            <div className="flex flex-1 flex-col text-xs text-muted-foreground">
              <span>Updated {dayjs(task.updatedAt).fromNow()}</span>
              <span>Created {dayjs(task.createdAt).fromNow()}</span>
            </div>
          </div>
        </DrawerTitle>

        <DrawerDivider />

        <div className="w-fit">
          <TaskStatusSelect task={task} size="default" />
        </div>

        <TaskDescription
          description={task.description}
          updateDescription={(description) =>
            updateTask({
              taskId: task.id,
              projectId: task.projectId,
              description,
            }).then(noop)
          }
        />

        <AsigneeSelect
          task={task}
          isUpdating={isUpdating}
          updateTask={(assigneeId) =>
            updateTask({
              taskId: task.id,
              projectId: task.projectId,
              assigneeId,
            }).then(noop)
          }
        />

        <TaskStoryPoints
          storyPoints={
            task.storyPoints !== null ? task.storyPoints.toString() : null
          }
          updateStoryPoints={saveStoryPoints}
        />
      </DrawerHeader>
    </DrawerContent>
  );
}
