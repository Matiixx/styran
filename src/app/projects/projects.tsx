"use client";

import { useState } from "react";

import map from "lodash/map";

import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

import AddNewProjectDialog from "./newProjectDialog";

export default function ProjectsComponent() {
  const [open, setOpen] = useState(false);

  const [data] = api.projects.getProjects.useSuspenseQuery();

  return (
    <div className="flex w-full flex-1 flex-row flex-wrap content-start items-start gap-12 overflow-y-scroll px-16 py-16 pt-32">
      {map(data, ({ name, ticker, id }) => {
        return (
          <Card key={id} className="w-full max-w-sm cursor-pointer">
            <CardHeader>
              <CardTitle className="truncate">
                [{ticker}] - {name}
              </CardTitle>
            </CardHeader>
          </Card>
        );
      })}

      <AddNewProjectDialog open={open} setOpen={setOpen} />
    </div>
  );
}
