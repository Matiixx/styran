import { type FC } from "react";
import { type Session } from "next-auth";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { ProfileSummaryCard } from "./profileSummaryCard";
import { ProfileTabs } from "./profileTabs";

type Props = {
  session: Session;
};

const MyProfilePage: FC<Props> = ({ session }) => {
  return (
    <Card disableHover className="mt-4 w-full max-w-screen-lg">
      <CardHeader>
        <CardTitle>My Profile </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ProfileSummaryCard session={session} />

          <ProfileTabs session={session} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MyProfilePage;
