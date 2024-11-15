"use client";

import { useMemo, useState } from "react";

import filter from "lodash/filter";
import includes from "lodash/includes";
import map from "lodash/map";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";

type User = NonNullable<ProjectRouterOutput["getProject"]>["users"][number];

type UsersListProps = {
  users: User[];
};

const UsersList = ({ users }: UsersListProps) => {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(
    () => filter(users, (user) => includes(user.email, search)),
    [users, search],
  );

  return (
    <div className="mx-4 my-8 flex w-full flex-col gap-6">
      <Input
        className="w-fit"
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex w-full flex-1 flex-col overflow-y-scroll">
        {map(filteredUsers, (user) => (
          <UserItem key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

const UserItem = ({ user }: { user: User }) => {
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
            <DropdownMenuItem variant="destructive" className="font-bold">
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default UsersList;
