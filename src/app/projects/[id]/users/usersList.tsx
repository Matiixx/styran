"use client";

import { useMemo, useState } from "react";

import filter from "lodash/filter";
import includes from "lodash/includes";
import map from "lodash/map";
import noop from "lodash/noop";

import { EllipsisVertical, Mail, Trash2, UserPlus } from "lucide-react";

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
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

import { AddUserToProjectDialog } from "./addUserToProjectDialog";
import { UserAvatar } from "~/app/_components/UserAvatar";

type User = NonNullable<ProjectRouterOutput["getProject"]>["users"][number];

type UsersListProps = {
  users: User[];
  project: NonNullable<ProjectRouterOutput["getProject"]>;
};

const UsersList = ({ users, project }: UsersListProps) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const { mutateAsync: resendInvitation } =
    api.projects.resendInvitation.useMutation();

  const filteredUsers = useMemo(
    () =>
      filter(
        users,
        (user) =>
          includes(user.email, search) ||
          includes(user.firstName, search) ||
          includes(user.lastName, search),
      ),
    [users, search],
  );

  return (
    <>
      <div className="mx-4 my-8 flex w-full flex-col gap-6 overflow-hidden">
        <div className="flex w-full flex-row items-center justify-between gap-4">
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

        <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto">
          {map(filteredUsers, (user) => (
            <UserItem
              key={user.id}
              user={user}
              isOwner={user.id === project.ownerId}
              setUser={setSelectedUser}
              resendInvitation={({ email }) =>
                resendInvitation({ email, projectId: project.id }).then(noop)
              }
            />
          ))}
        </div>
      </div>

      <DeleteUserModal
        user={selectedUser}
        projectId={project.id}
        setUser={setSelectedUser}
      />

      <AddUserToProjectDialog
        isOpen={openAddUserDialog}
        projectId={project.id}
        closeDialog={() => setOpenAddUserDialog(false)}
      />
    </>
  );
};

const UserItem = ({
  user,
  isOwner,
  setUser,
  resendInvitation,
}: {
  user: User;
  isOwner: boolean;
  setUser: (user: User) => void;
  resendInvitation: (user: User) => Promise<void>;
}) => {
  return (
    <Card className="flex w-full p-4">
      <CardContent className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <UserAvatar user={user} size="md" />
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <span className="text-lg font-bold">
                {user.firstName} {user.lastName}
              </span>
              {isOwner && <Badge>Owner</Badge>}
            </div>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>

        {!isOwner && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                onSelect={(e) => e.preventDefault()}
              >
                <DropdownMenuItem
                  icon={<Mail />}
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => resendInvitation(user)}
                >
                  Resend invitation
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  className="font-bold"
                  onClick={() => setUser(user)}
                >
                  <Trash2 />
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
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
