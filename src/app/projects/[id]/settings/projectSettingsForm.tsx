"use client";

import { useState } from "react";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
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

export default function ProjectSettingsForm({
  project,
}: ProjectSettingsFormProps) {
  const [name, setName] = useState(project.name);
  const [ticker, setTicker] = useState(project.ticker);
  const [timezone, setTimezone] = useState(project.timezone.toString());

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
            <InputWithLabel
              label="Project Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />

            <InputWithLabel
              label="Project Ticker"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value);
              }}
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label>Project Description</Label>
            <Textarea
              value={""}
              onChange={(e) => {
                console.log(e.target.value);
              }}
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label>Project Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
              }}
            >
              <SelectTrigger id="project-timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-12">UTC-12:00</SelectItem>
                <SelectItem value="-11">UTC-11:00</SelectItem>
                <SelectItem value="-10">UTC-10:00</SelectItem>
                <SelectItem value="-9">UTC-09:00</SelectItem>
                <SelectItem value="-8">UTC-08:00 (PST)</SelectItem>
                <SelectItem value="-7">UTC-07:00 (MST)</SelectItem>
                <SelectItem value="-6">UTC-06:00 (CST)</SelectItem>
                <SelectItem value="-5">UTC-05:00 (EST)</SelectItem>
                <SelectItem value="-4">UTC-04:00</SelectItem>
                <SelectItem value="-3">UTC-03:00</SelectItem>
                <SelectItem value="-2">UTC-02:00</SelectItem>
                <SelectItem value="-1">UTC-01:00</SelectItem>
                <SelectItem value="0">UTC±00:00</SelectItem>
                <SelectItem value="1">UTC+01:00 (CET)</SelectItem>
                <SelectItem value="2">UTC+02:00 (EET)</SelectItem>
                <SelectItem value="3">UTC+03:00</SelectItem>
                <SelectItem value="4">UTC+04:00</SelectItem>
                <SelectItem value="5">UTC+05:00</SelectItem>
                <SelectItem value="5.5">UTC+05:30 (IST)</SelectItem>
                <SelectItem value="6">UTC+06:00</SelectItem>
                <SelectItem value="7">UTC+07:00</SelectItem>
                <SelectItem value="8">UTC+08:00</SelectItem>
                <SelectItem value="9">UTC+09:00 (JST)</SelectItem>
                <SelectItem value="10">UTC+10:00</SelectItem>
                <SelectItem value="11">UTC+11:00</SelectItem>
                <SelectItem value="12">UTC+12:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
