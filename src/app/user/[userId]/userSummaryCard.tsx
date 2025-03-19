import { Briefcase, CalendarCheck2, MapPin } from "lucide-react";
import { format } from "date-fns";

import { type UserRouterOutputs } from "~/server/api/routers/user";
import { UserAvatar } from "~/app/_components/UserAvatar";
import { Card, CardContent } from "~/components/ui/card";

type UserSummaryCardProps = {
  userInfo: UserRouterOutputs["getUserInfo"];
};

const UserSummaryCardServer = ({ userInfo }: UserSummaryCardProps) => {
  return (
    <Card disableHover>
      <CardContent className="flex flex-col items-center gap-4">
        <UserAvatar className="h-20 w-20 text-3xl" user={userInfo} />
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold">
            {userInfo.firstName} {userInfo.lastName}
          </h2>
          <p className="text-sm text-gray-500">{userInfo.email}</p>
        </div>

        <div className="flex w-full flex-col justify-start gap-4">
          <div className="flex flex-row items-center gap-2">
            <MapPin className="text-gray-500" size={18} />
            <span className="text-sm">{userInfo.location ?? "-"}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Briefcase className="text-gray-500" size={18} />
            <span className="text-sm">{userInfo.jobTitle ?? "-"}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <CalendarCheck2 className="text-gray-500" size={18} />
            <span className="text-sm">
              Joined {format(userInfo.createdAt, "dd/MM/yyyy")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { UserSummaryCardServer };
