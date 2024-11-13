"use client";

import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";

import { ProjectDialog } from "./projectPage.types";
import { DeleteProjectDialog, DeleteProjectItem } from "./deleteProjectItem";
import { EditProjectDialog } from "./editProjectItem";

type ProjectDropdownProps = {
  project: NonNullable<ProjectRouterOutput["getProject"]>;
};

const ProjectDropdown = ({ project }: ProjectDropdownProps) => {
  const [openedDialogType, setOpenedDialogType] =
    useState<ProjectDialog | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenedDialogType(ProjectDialog.EDIT)}
          >
            Edit
          </DropdownMenuItem>
          <DeleteProjectItem
            openDialog={() => setOpenedDialogType(ProjectDialog.DELETE)}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProjectDialog
        id={project.id}
        isOpen={openedDialogType === ProjectDialog.DELETE}
        closeDialog={() => setOpenedDialogType(null)}
      />

      <EditProjectDialog
        isOpen={openedDialogType === ProjectDialog.EDIT}
        project={project}
        closeDialog={() => setOpenedDialogType(null)}
      />
    </>
  );
};

export default ProjectDropdown;
