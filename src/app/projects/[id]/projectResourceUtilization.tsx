import { Clock } from "lucide-react";

import map from "lodash/map";

import { cn } from "~/lib/utils";
import { UserAvatar } from "~/app/_components/UserAvatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";

type ProjectResourceUtilizationProps = {
  projectId: string;
};

const USERS_UTILIZATION = [
  { name: "Jane S.", utilization: 38 },
  { name: "John D.", utilization: 25 },
  { name: "Michael R.", utilization: 17 },
  { name: "Emily F.", utilization: 10 },
  { name: "Daniel M.", utilization: 42 },
];

export default function ProjectResourceUtilization({
  projectId,
}: ProjectResourceUtilizationProps) {
  return (
    <Card disableHover>
      <CardHeader>
        <CardTitle>Resource Utilization</CardTitle>
        <CardDescription>
          Team members&apos; hours worked vs. capacity
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {map(USERS_UTILIZATION, ({ name, utilization }) => (
            <UserUtilization key={name} name={name} utilization={utilization} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const UserUtilization = ({
  name,
  utilization,
}: {
  name: string;
  utilization: number;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar
            size="md"
            user={{ email: name, firstName: name, lastName: name }}
          />
          <span>{name}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1",
            getUtilizationColor(utilization),
          )}
        >
          <Clock size={16} />
          <span>{utilization}/40 hrs</span>
        </div>
      </div>
      <div>
        <Progress value={(utilization / 40) * 100} className="h-2" />
      </div>
      <span
        className={cn(
          "text-xs text-muted-foreground",
          utilization > 40 && "text-red-500",
        )}
      >
        Utilization {(utilization / 40) * 100}%
      </span>
      <Separator />
    </div>
  );
};

const getUtilizationColor = (utilization: number) => {
  if ((utilization / 40) * 100 > 90) return "text-red-500";
  if ((utilization / 40) * 100 > 75) return "text-yellow-500";
  return "text-green-500";
};
