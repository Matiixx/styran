import { type z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addMonths, isBefore, subDays } from "date-fns";

import { api } from "~/trpc/react";
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

export const StartSprintModal = ({
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
