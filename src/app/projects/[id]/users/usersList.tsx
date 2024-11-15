"use client";

import { useMemo, useState } from "react";

import filter from "lodash/filter";
import includes from "lodash/includes";
import map from "lodash/map";

import { EllipsisVertical, UserPlus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { AddUserToProjectDialog } from "./addUserToProjectDialog";

type User = NonNullable<ProjectRouterOutput["getProject"]>["users"][number];

type UsersListProps = {
  users: User[];
  projectId: string;
};

const UsersList = ({ users, projectId }: UsersListProps) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const filteredUsers = useMemo(
    () => filter(users, (user) => includes(user.email, search)),
    [users, search],
  );

  return (
    <>
      <div className="mx-4 my-8 flex w-full flex-col gap-6">
        <div className="flex w-full flex-row items-center gap-4">
          <Input
            className="w-fit"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button onClick={() => setOpenAddUserDialog(true)}>
            <UserPlus />
            Add user
          </Button>
        </div>

        <div className="flex w-full flex-1 flex-col overflow-y-scroll">
          {map(filteredUsers, (user) => (
            <UserItem key={user.id} user={user} setUser={setSelectedUser} />
          ))}
        </div>
      </div>

      <DeleteUserModal
        user={selectedUser}
        projectId={projectId}
        setUser={setSelectedUser}
      />

      <AddUserToProjectDialog
        isOpen={openAddUserDialog}
        projectId={projectId}
        closeDialog={() => setOpenAddUserDialog(false)}
      />
    </>
  );
};

const UserItem = ({
  user,
  setUser,
}: {
  user: User;
  setUser: (user: User) => void;
}) => {
  return (
    <div className="flex w-full flex-row items-center justify-between border px-4 py-2">
      <div className="flex flex-col">
        <span className="text-lg font-bold">{user.email}</span>
        <span className="text-md">
          {user.firstName} {user.lastName}
        </span>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              className="font-bold"
              onClick={() => setUser(user)}
            >
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const DeleteUserModal = ({
  user,
  projectId,
  setUser,
}: {
  user: User | null;
  projectId: string;
  setUser: (user: User | null) => void;
}) => {
  const utils = api.useUtils();

  const { mutateAsync: removeUserFromProject } =
    api.projects.removeUserFromProject.useMutation({
      onSuccess: () => {
        setUser(null);
        return utils.projects.getProject.invalidate({ id: projectId });
      },
    });

  return (
    <Dialog open={!!user} onOpenChange={() => setUser(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user</DialogTitle>
        </DialogHeader>

        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold">{user?.email}</span>?
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => setUser(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              removeUserFromProject({ id: projectId, userId: user!.id })
            }
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsersList;
