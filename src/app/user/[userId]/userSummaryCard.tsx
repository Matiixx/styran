import { Briefcase, CalendarCheck2, MapPin } from "lucide-react";
import { format } from "date-fns";

import { type UserRouterOutputs } from "~/server/api/routers/user";
import { UserAvatar } from "~/app/_components/UserAvatar";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type UserSummaryCardProps = {
  userInfo: UserRouterOutputs["getUserInfo"] | null;
};

const UserSummaryCardServer = ({ userInfo }: UserSummaryCardProps) => {
  return (
    <Card disableHover>
      <CardContent className="flex flex-col items-center gap-4">
        <UserAvatar className="h-20 w-20 text-3xl" user={userInfo} />

        <div className="flex w-full flex-col items-center gap-1">
          {userInfo ? (
            <h2 className="text-xl font-bold">
              {userInfo.firstName} {userInfo.lastName}
            </h2>
          ) : (
            <Skeleton className="h-7 w-1/2" />
          )}
          {userInfo ? (
            <p className="text-sm text-gray-500">{userInfo.email}</p>
          ) : (
            <Skeleton className="h-5 w-1/2" />
          )}
        </div>

        <div className="flex w-full flex-col justify-start gap-4">
          <div className="flex flex-row items-center gap-2">
            <MapPin className="text-gray-500" size={18} />
            {userInfo ? (
              <span className="text-sm">{userInfo.location ?? "-"}</span>
            ) : (
              <Skeleton className="h-5 w-1/2" />
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <Briefcase className="text-gray-500" size={18} />
            {userInfo ? (
              <span className="text-sm">{userInfo.jobTitle ?? "-"}</span>
            ) : (
              <Skeleton className="h-5 w-1/2" />
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <CalendarCheck2 className="text-gray-500" size={18} />
            {userInfo ? (
              <span className="text-sm">
                Joined {format(userInfo.createdAt, "dd/MM/yyyy")}
              </span>
            ) : (
              <Skeleton className="h-5 w-1/2" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { UserSummaryCardServer };
