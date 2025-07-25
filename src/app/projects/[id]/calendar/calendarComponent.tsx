"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { redirect } from "next/navigation";

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import withDragAndDrop, {
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";

import compact from "lodash/compact";
import filter from "lodash/filter";
import map from "lodash/map";
import toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";

import { api } from "~/trpc/react";

import dayjs from "~/utils/dayjs";
import { combinedTypeKey, taskTypesOptions } from "~/utils/taskUtils";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./customCalendarStyles.css";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import {
  CalendarCreateEventDialog,
  CalendarTaskDialog,
} from "./CalendarTaskDialog";

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
import { useLiveTasks } from "../backlog/hooks";

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
  const { tasks } = useLiveTasks(projectId);

  const [tempTasks, setTempTasks] = useState<Tasks>(tasks);
  const [selectedEvent, setSelectedEvent] = useState<TaskEvent | null>(null);
  const [contextDate, setContextDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

    if (showType !== ALL_SELECT) {
      const filterByTaskType = filter(filteredTasks, (task) => {
        const taskTypeKey = combinedTypeKey(task.type, task.customType);
        return taskTypeKey === showType;
      });

      return map(filterByTaskType, taskToCalendarEvent);
    }

    return compact([
      sprintToCalendarEvent(project?.sprint),
      ...map(filteredTasks, taskToCalendarEvent),
    ]);
  }, [tempTasks, project?.sprint, search, userFilter, statusFilter, showType]);

  useEffect(() => {
    setTempTasks(tasks);
  }, [tasks]);

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

  const ignoreNextSlot = useRef(false);

  const handleCreateEvent = () => {
    if (contextDate) {
      setSelectedDate(contextDate);
      setContextDate(null);
      ignoreNextSlot.current = false;
    }
  };

  if (!project) {
    redirect("/projects");
  }

  return (
    <ProjectPageShell userId={userId} project={project}>
      <div className="flex flex-col">
        <div>
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
                <SelectItem value={ShowType.SPRINT}>Sprint</SelectItem>
                <SelectItem value={ShowType.TASKS}>Tasks</SelectItem>
                {map(
                  taskTypesOptions(project.customTaskTypes),
                  ({ type, value, customType }) => (
                    <SelectItem key={value} value={value}>
                      {upperFirst(toLower(customType ?? type))}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </SortTasksHeader>
        </div>

        <div className="mt-4 min-h-[750px] flex-1">
          <DnDCalendar
            localizer={localizer}
            defaultDate={dayjs().toDate()}
            defaultView="month"
            resizable
            selectable
            views={["month"]}
            events={events}
            onSelectSlot={(e) => {
              if (ignoreNextSlot.current) {
                ignoreNextSlot.current = false;
                return;
              }
              if (contextDate) {
                return setContextDate(null);
              }
              setContextDate(e.slots[0]!);
            }}
            style={{ height: "100%", color: "white" }}
            components={{
              dateCellWrapper: (props) => {
                return (
                  <DropdownMenu
                    open={props.value.valueOf() === contextDate?.valueOf()}
                    onOpenChange={(open) => {
                      if (!open) {
                        ignoreNextSlot.current = true;
                        setContextDate(null);
                      }
                    }}
                  >
                    <DropdownMenuTrigger
                      asChild
                      className="pointer-events-none"
                    >
                      <div
                        className="flex h-full w-full overflow-visible border-l-[1px]"
                        {...props}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>
                        {dayjs(contextDate).format("LL")}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={handleCreateEvent}>
                        Create New Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              },
            }}
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
            onSelectEvent={setSelectedEvent}
          />
        </div>
      </div>

      <CalendarTaskDialog
        task={tasks.find((t) => t.id === selectedEvent?.resource.id)}
        setOpen={() => setSelectedEvent(null)}
      />

      <CalendarCreateEventDialog
        key={selectedDate?.valueOf()}
        day={selectedDate}
        projectId={projectId}
        customTaskTypes={project.customTaskTypes}
        setOpen={() => {
          setSelectedDate(null);
          setContextDate(null);
        }}
      />
    </ProjectPageShell>
  );
}
