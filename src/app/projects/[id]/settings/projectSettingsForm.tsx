"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { api } from "~/trpc/react";

import { editProjectSchema } from "~/lib/schemas";

import { InputWithLabel } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type ProjectSettingsFormProps = {
  project: NonNullable<ProjectRouterOutput["getProjectSettings"]>;
};

const editProjectSchemaForm = editProjectSchema.extend({
  timezone: z.string(),
});

const getDefaultValues = (
  project: NonNullable<ProjectRouterOutput["getProjectSettings"]>,
): z.infer<typeof editProjectSchemaForm> => {
  return {
    id: project.id,
    name: project.name,
    ticker: project.ticker,
    description: project.description ?? null,
    timezone: project.timezone.toString() ?? "1",
    discordWebhookUrl: project.discordWebhookUrl ?? null,
  };
};

export default function ProjectSettingsForm({
  project,
}: ProjectSettingsFormProps) {
  const { mutateAsync: updateProject } = api.projects.editProject.useMutation();

  const {
    control,
    formState: { errors },
    reset,
    register,
    handleSubmit,
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(project),
    resolver: zodResolver(editProjectSchemaForm),
  });

  const onSubmit = handleSubmit((data) => {
    return updateProject({
      ...data,
      timezone: Number(data.timezone),
    })
      .then(() =>
        toast("Project settings updated successfully", {
          icon: "🔧",
        }),
      )
      .catch(() =>
        toast.error("Failed to update project settings, please try again.", {
          icon: "🚨",
        }),
      );
  });

  return (
    <div className="w-full">
      <Card disableHover className="max-w-4xl">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Basic information about your project
          </CardDescription>
        </CardHeader>
        <CardContent className="flex w-full flex-col gap-6">
          <div className="flex w-full flex-row gap-4">
            <InputWithLabel label="Project Name" {...register("name")} />

            <InputWithLabel label="Project Ticker" {...register("ticker")} />
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label>Project Description</Label>
            <Textarea {...register("description")} />
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label>Project Timezone</Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger id="project-timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <InputWithLabel
            label="Discord Webhook URL"
            placeholder="https://discord.com/api/webhooks/..."
            description="The URL of the Discord webhook for your project. You will receive notifications about project."
            error={!!errors.discordWebhookUrl}
            errorMessage={errors.discordWebhookUrl?.message}
            {...register("discordWebhookUrl")}
          />

          <div className="flex w-full justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => reset(getDefaultValues(project))}
            >
              Restore Defaults
            </Button>
            <Button onClick={onSubmit}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const timezones = [
  { value: "-12", label: "UTC-12:00" },
  { value: "-11", label: "UTC-11:00" },
  { value: "-10", label: "UTC-10:00" },
  { value: "-9", label: "UTC-09:00" },
  { value: "-8", label: "UTC-08:00 (PST)" },
  { value: "-7", label: "UTC-07:00 (MST)" },
  { value: "-6", label: "UTC-06:00 (CST)" },
  { value: "-5", label: "UTC-05:00 (EST)" },
  { value: "-4", label: "UTC-04:00" },
  { value: "-3", label: "UTC-03:00" },
  { value: "-2", label: "UTC-02:00" },
  { value: "-1", label: "UTC-01:00" },
  { value: "0", label: "UTC±00:00" },
  { value: "1", label: "UTC+01:00 (CET)" },
  { value: "2", label: "UTC+02:00 (EET)" },
  { value: "3", label: "UTC+03:00" },
  { value: "4", label: "UTC+04:00" },
  { value: "5", label: "UTC+05:00" },
  { value: "5.5", label: "UTC+05:30 (IST)" },
  { value: "6", label: "UTC+06:00" },
  { value: "7", label: "UTC+07:00" },
  { value: "8", label: "UTC+08:00" },
  { value: "9", label: "UTC+09:00 (JST)" },
  { value: "10", label: "UTC+10:00" },
  { value: "11", label: "UTC+11:00" },
  { value: "12", label: "UTC+12:00" },
] as const;
