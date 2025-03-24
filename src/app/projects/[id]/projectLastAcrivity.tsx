import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import map from "lodash/map";

import { UserAvatar } from "~/app/_components/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type ProjectLastActivityProps = {
  projectId: string;
};

const LAST_ACTIVITY = [
  {
    user: {
      firstName: "Jane",
      lastName: "S.",
      email: "jane.s@example.com",
    },
    action: "task-create",
    task: "Task 1",
    date: dayjs().subtract(1, "day"),
  },
  {
    user: {
      firstName: "John",
      lastName: "D.",
      email: "john.d@example.com",
    },
    action: "task-update",
    task: "Task 2",
    date: dayjs().subtract(2, "day"),
  },
  {
    user: {
      firstName: "Michael",
      lastName: "R.",
      email: "michael.r@example.com",
    },
    action: "task-comment",
    task: "Task 3",
    date: dayjs().subtract(3, "day"),
  },
  {
    user: {
      firstName: "Emily",
      lastName: "F.",
      email: "emily.f@example.com",
    },
    action: "time-track",
    date: dayjs().subtract(4, "day"),
  },
];

export default function ProjectLastActivity({
  projectId,
}: ProjectLastActivityProps) {
  return (
    <Card disableHover>
      <CardHeader>
        <CardTitle>Last Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {map(LAST_ACTIVITY, (activity) => (
            <AcivityCard key={activity.user.email} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const AcivityCard = ({
  activity,
}: {
  activity: (typeof LAST_ACTIVITY)[number];
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar user={activity.user} size="sm" />
          <span>{getActivityText(activity)}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {activity.date.fromNow()}
        </span>
      </div>
      <Separator />
    </div>
  );
};

const getActivityText = (activity: (typeof LAST_ACTIVITY)[number]) => {
  switch (activity.action) {
    case "task-create":
      return `${activity.user.firstName} created a task ${activity.task} `;
    case "task-update":
      return `${activity.user.firstName} updated a task ${activity.task} `;
    case "task-comment":
      return `${activity.user.firstName} commented on a task ${activity.task}`;
    case "time-track":
      return `${activity.user.firstName} tracked time`;
  }
};
