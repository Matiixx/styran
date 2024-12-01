import { useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

export default function CurrentSprint() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-row justify-end gap-4">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Start new sprint
        </Button>
      </div>

      <StartSprintModal isOpen={open} closeDialog={() => setOpen(false)} />
    </>
  );
}

const StartSprintSchema = z.object({
  name: z.string(),
  goal: z.string().optional(),
  startDate: z.date().default(new Date()),
  endDate: z.date(),
  includeTasksFromBacklog: z.boolean().default(false),
});

const StartSprintModal = ({
  isOpen,
  closeDialog,
}: {
  isOpen: boolean;
  closeDialog: () => void;
}) => {
  const { control, register, reset, handleSubmit } = useForm<
    z.infer<typeof StartSprintSchema>
  >({
    mode: "onChange",
    resolver: zodResolver(StartSprintSchema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
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
              endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
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
            // error={!!errors.name}
            // errorMessage={errors.name?.message}
            {...register("name")}
          />

          <InputWithLabel
            label="Sprint goal"
            placeholder="Sprint goal"
            {...register("goal")}
          />

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
