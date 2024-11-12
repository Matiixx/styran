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

import { DeleteProjectDialog, DeleteProjectItem } from "./deleteProjectItem";

type ProjectDropdownProps = {
  id: string;
};

const ProjectDropdown = ({ id }: ProjectDropdownProps) => {
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

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
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DeleteProjectItem setIsOpen={setIsOpenDeleteDialog} />
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProjectDialog
        id={id}
        isOpen={isOpenDeleteDialog}
        setIsOpen={setIsOpenDeleteDialog}
      />
    </>
  );
};

export default ProjectDropdown;
