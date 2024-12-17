import { type FC } from "react";
import { TaskStatus } from "@prisma/client";

import { map } from "lodash";

import { type ProjectRouterOutput } from "~/server/api/routers/projects";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type User = NonNullable<ProjectRouterOutput["getProject"]>["users"][number];

type SortTasksHeaderProps = {
  users: User[];
  search: string;
  userFilter: string;
  statusFilter: string;
  setSearch: (search: string) => void;
  setUserFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
};

export const ALL_SELECT = "ALL";

const SortTasksHeader: FC<SortTasksHeaderProps> = ({
  users,
  search,
  userFilter,
  statusFilter,
  setSearch,
  setUserFilter,
  setStatusFilter,
}) => {
  return (
    <div className="flex flex-row items-center gap-4">
      <Input
        value={search}
        placeholder="Search"
        className="max-w-[180px]"
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <Select value={statusFilter} onValueChange={(e) => setStatusFilter(e)}>
        <SelectTrigger className="w-[160px] text-black">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_SELECT}>All statuses</SelectItem>
          {map(TaskStatus, (status, key) => (
            <SelectItem key={key} value={status}>
              {status.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={userFilter} onValueChange={(e) => setUserFilter(e)}>
        <SelectTrigger className="w-[160px] text-black">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_SELECT}>All users</SelectItem>
          {map(users, (user, key) => (
            <SelectItem key={key} value={user.id}>
              {user.firstName} {user.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { SortTasksHeader };
