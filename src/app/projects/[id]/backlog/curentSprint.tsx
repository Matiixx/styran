import { useState } from "react";
import { type z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addMonths, isBefore, subDays } from "date-fns";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import map from "lodash/map";

import { api } from "~/trpc/react";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { StartSprintSchema } from "~/lib/schemas/sprintSchemas";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { InputWithLabel } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { DatePicker } from "~/components/ui/datePicker";
import { type TasksRouterOutput } from "~/server/api/routers/tasks";
import { TaskCard } from "./tasksList";

type Project = NonNullable<ProjectRouterOutput["getProject"]>;
type Task = TasksRouterOutput["getTasks"][number];

export default function CurrentSprint({
  tasks,
  project,
}: {
  tasks: Task[];
  project: Project;
}) {
  const [open, setOpen] = useState(false);

  const isSprintActive = !isEmpty(project.sprint);

  return (
    <div className="bg-white/20">
      <div className="my-2 flex flex-row items-center justify-between gap-4">
        {isSprintActive ? (
          <>
            <div>
              <span className="text-lg font-semibold">
                {project.sprint?.[0]?.name}
              </span>
            </div>
            <Button variant="secondary">End sprint</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Start new sprint
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {map(
          filter(tasks, (t) => !!t.sprintId),
          (task) => (
            <TaskCard key={task.id} task={task} />
          ),
        )}
      </div>

      <StartSprintModal
        isOpen={open}
        projectId={project.id}
        closeDialog={() => setOpen(false)}
      />
    </div>
  );
}

const StartSprintModal = ({
  isOpen,
  projectId,
  closeDialog,
}: {
  isOpen: boolean;
  projectId: string;
  closeDialog: () => void;
}) => {
  const utils = api.useUtils();
  const { mutateAsync: startSprint } = api.sprint.startSprint.useMutation({
    onSuccess: () =>
      Promise.all([
        utils.tasks.getTasks.invalidate({ projectId }),
        utils.projects.getProject.invalidate({ id: projectId }),
      ]),
  });

  const {
    control,
    formState: { errors },
    reset,
    register,
    setValue,
    getValues,
    handleSubmit,
  } = useForm<z.infer<typeof StartSprintSchema>>({
    mode: "onChange",
    resolver: zodResolver(StartSprintSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: addDays(new Date(), 14),
      includeTasksFromBacklog: false,
    },
  });

  const onSubmit = handleSubmit((data) => {
    return startSprint({ ...data, projectId });
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        onAnimationEnd={(e) => {
          if (e.animationName === "exit") {
            reset({
              name: "",
              goal: "",
              startDate: new Date(),
              endDate: addDays(new Date(), 14),
              includeTasksFromBacklog: false,
            });
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Start sprint</DialogTitle>
        </DialogHeader>

        <form className="my-2 flex flex-col gap-4">
          <InputWithLabel
            label="Sprint name"
            placeholder="Sprint name"
            error={!!errors.name}
            errorMessage={errors.name?.message}
            {...register("name")}
          />

          <InputWithLabel
            label="Sprint goal"
            placeholder="Sprint goal"
            {...register("goal")}
          />

          <div>
            <Label>Start date</Label>
            <Controller
              control={control}
              name="startDate"
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  date={value}
                  setDate={(date) => {
                    onChange(date);
                    if (date && isBefore(getValues("endDate"), date)) {
                      setValue("endDate", addDays(date, 1));
                    }
                  }}
                  className="w-full"
                  minDate={subDays(new Date(), 1)}
                  maxDate={addMonths(new Date(), 1)}
                />
              )}
            />
          </div>

          <div>
            <Label>End date</Label>
            <Controller
              control={control}
              name="endDate"
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  date={value}
                  setDate={onChange}
                  minDate={addDays(getValues("startDate"), 1)}
                  maxDate={addMonths(getValues("startDate"), 1)}
                  className="w-full"
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="includeTasksFromBacklog"
            render={({ field: { value, onChange } }) => (
              <div className="flex flex-row items-center justify-between gap-2">
                <Label>Include tasks from backlog</Label>
                <Switch checked={value} onCheckedChange={onChange} />
              </div>
            )}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="default" onClick={onSubmit}>
            Start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
