"use client";

import { useCallback, useMemo, useState } from "react";
import { redirect } from "next/navigation";

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";

import compact from "lodash/compact";
import map from "lodash/map";
import upperFirst from "lodash/upperFirst";

import { api } from "~/trpc/react";
import ProjectNavigationButtons from "~/app/_components/projectNavigationButtons";

import dayjs from "~/utils/dayjs";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./customCalendarStyles.css";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";

import ProjectPageShell from "../projectPageShell";
import {
  sprintToCalendarEvent,
  stringToRGB,
  taskToCalendarEvent,
  type TaskEvent,
} from "./utils";
import {
  ALL_SELECT,
  filterTasks,
  SortTasksHeader,
} from "../backlog/sortHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const localizer = dayjsLocalizer(dayjs);
const DnDCalendar = withDragAndDrop<TaskEvent>(Calendar);

type CalendarComponentProps = {
  userId: string;
  projectId: string;
};
type Tasks = TasksRouterOutput["getTasks"];

const ShowType = {
  TASKS: "Tasks",
  SPRINT: "Sprint",
} as const;

export default function CalendarComponent({
  userId,
  projectId,
}: CalendarComponentProps) {
  const utils = api.useUtils();
  const [project] = api.projects.getProject.useSuspenseQuery({ id: projectId });
  const [tasks] = api.tasks.getTasks.useSuspenseQuery({ projectId });

  const [tempTasks, setTempTasks] = useState<Tasks>(tasks);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_SELECT);
  const [userFilter, setUserFilter] = useState(ALL_SELECT);
  const [showType, setShowType] = useState(ALL_SELECT);

  const { mutateAsync: updateTask } = api.tasks.updateTask.useMutation({
    onSuccess: () => utils.tasks.getTasks.invalidate({ projectId }),
  });

  const [disabledTasks, setDisabledTasks] = useState<string[]>([]);

  const events = useMemo(() => {
    if (showType === ShowType.SPRINT) {
      return compact([sprintToCalendarEvent(project?.sprint)]);
    }

    const filteredTasks = filterTasks(
      tempTasks,
      search,
      userFilter,
      statusFilter,
    );
    if (showType === ShowType.TASKS) {
      return map(filteredTasks, taskToCalendarEvent);
    }

    return compact([
      sprintToCalendarEvent(project?.sprint),
      ...map(filteredTasks, taskToCalendarEvent),
    ]);
  }, [tempTasks, project?.sprint, search, userFilter, statusFilter, showType]);

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
    [projectId, tasks, updateTask],
  );

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <ProjectNavigationButtons id={projectId} />

      <div className="flex flex-col overflow-y-auto">
        <div className="my-4">
          <SortTasksHeader
            users={project.users}
            search={search}
            userFilter={userFilter}
            statusFilter={statusFilter}
            setSearch={setSearch}
            setUserFilter={setUserFilter}
            setStatusFilter={setStatusFilter}
          >
            <Select value={showType} onValueChange={(e) => setShowType(e)}>
              <SelectTrigger className="w-[160px] text-black">
                <SelectValue placeholder="All events" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={ALL_SELECT}>All events</SelectItem>
                {map(ShowType, (type, key) => (
                  <SelectItem key={key} value={type}>
                    {upperFirst(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SortTasksHeader>
        </div>

        <div className="mt-2 min-h-[800px] flex-1">
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
      </div>
    </ProjectPageShell>
  );
}
