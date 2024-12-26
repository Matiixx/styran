"use client";

import { useCallback, useMemo, useState } from "react";
import { redirect } from "next/navigation";

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import dayjs from "dayjs";
import { map } from "lodash";

import { api } from "~/trpc/react";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./customCalendarStyles.css";

import ProjectPageShell from "../projectPageShell";
import { stringToRGB, toBigCalendarEvent, type TaskEvent } from "./utils";
import { TasksRouterOutput } from "~/server/api/routers/tasks";

const localizer = dayjsLocalizer(dayjs);
const DnDCalendar = withDragAndDrop<TaskEvent>(Calendar);

type CalendarComponentProps = {
  userId: string;
  projectId: string;
};
type Tasks = TasksRouterOutput["getTasks"];

export default function CalendarComponent({
  userId,
  projectId,
}: CalendarComponentProps) {
  const utils = api.useUtils();
  const [project] = api.projects.getProject.useSuspenseQuery({ id: projectId });
  const [tasks] = api.tasks.getTasks.useSuspenseQuery({ projectId });

  const [tempTasks, setTempTasks] = useState<Tasks>(tasks);

  const { mutateAsync: updateTask } = api.tasks.updateTask.useMutation({
    onSuccess: () => utils.tasks.getTasks.invalidate({ projectId }),
  });

  const [disabledTasks, setDisabledTasks] = useState<string[]>([]);

  const events = useMemo(() => {
    return map(tempTasks, toBigCalendarEvent);
  }, [tempTasks]);

  const onEventResize = useCallback(
    (e: EventInteractionArgs<TaskEvent>) => {
      const startChanged = e.start !== e.event.start;
      const endChanged = e.end !== e.event.end;
      const taskId = e.event.resource.id;
      const startAt = startChanged ? dayjs(e.start).toDate() : e.event.start;
      const doneAt = endChanged ? dayjs(e.end).toDate() : e.event.end;

      setDisabledTasks((prev) => [...prev, taskId]);
      setTempTasks((prev) => {
        const newTasks = prev.map((t) =>
          t.id === taskId ? { ...t, startAt, doneAt } : t,
        );
        return newTasks;
      });

      return updateTask({
        projectId,
        taskId,
        startAt: startAt ?? undefined,
        doneAt: doneAt ?? undefined,
      })
        .catch(() => setTempTasks(tasks))
        .finally(() =>
          setDisabledTasks((prev) => prev.filter((id) => id !== taskId)),
        );
    },
    [projectId],
  );

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <ProjectNavigationButtons id={projectId} />

      <div className="mt-2 flex-1">
        <DnDCalendar
          localizer={localizer}
          defaultDate={dayjs().toDate()}
          defaultView="month"
          resizable
          selectable
          events={events}
          style={{ height: "100%", color: "white" }}
          eventPropGetter={(taskEvent) => {
            const { background, foreground } = stringToRGB(
              taskEvent.resource.id,
            );
            return {
              className: disabledTasks.includes(taskEvent.resource.id)
                ? "opacity-50"
                : "",
              style: { backgroundColor: background, color: foreground },
            };
          }}
          onEventResize={onEventResize}
          // onEventDrop={}
          onDrillDown={() => {
            // onClick day number
          }}
          onSelectSlot={() => {
            // onClick whole day cell
          }}
        />
      </div>
    </ProjectPageShell>
  );
}
