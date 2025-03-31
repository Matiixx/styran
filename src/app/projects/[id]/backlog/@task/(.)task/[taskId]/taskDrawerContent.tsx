import { useCallback } from "react";

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
import TaskComments, { type Comment } from "./taskComments";
import TaskTimeTracker, { type TimeTrack } from "./taskTimeTracker";
import TaskSettings from "./taskSettings";
import { TaskPrioritySelect } from "./taskPrioritySelect";

type TaskDrawerContentProps = {
  task: NonNullable<TasksRouterOutput["getTask"]>;
  userId: string;
  comments: Comment[];
  trackTimes: TimeTrack[];
  closeDrawer: () => void;
};

export default function TaskDrawerContent({
  task,
  userId,
  comments,
  trackTimes,
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

  const saveTitle = useCallback(
    (value: string) => {
      return updateTask({
        taskId: task.id,
        projectId: task.projectId,
        title: value,
      }).then(noop);
    },
    [task.id, task.projectId, updateTask],
  );

  const saveStoryPoints = useCallback(
    (value: number | null) => {
      return updateTask({
        taskId: task.id,
        projectId: task.projectId,
        storyPoints: value,
      }).then(noop);
    },
    [task.id, task.projectId, updateTask],
  );

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
      </DrawerHeader>

      <DrawerDivider />

      <div className="flex flex-col gap-6 overflow-y-auto p-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-2">
            <TaskStatusSelect task={task} size="default" />
            <TaskPrioritySelect
              taskId={task.id}
              projectId={task.projectId}
              taskPriority={task.priority ?? "NONE"}
            />
          </div>
          <TaskSettings
            taskId={task.id}
            projectId={task.projectId}
            closeDrawer={closeDrawer}
          />
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

        <TaskTimeTracker
          userId={userId}
          taskId={task.id}
          trackTimes={trackTimes}
        />

        <TaskComments
          userId={userId}
          taskId={task.id}
          comments={comments}
          projectId={task.projectId}
        />
      </div>
    </DrawerContent>
  );
}
