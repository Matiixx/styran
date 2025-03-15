import { type FC } from "react";
import { type Session } from "next-auth";

import { api } from "~/trpc/server";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { ProfileTabs } from "./profileTabs";
import ProfileSummaryCardWrapper from "./profileSummary/profileSummaryCardWrapper";
import { ProfileSummaryCard } from "./profileSummary/profileSummaryCardServer";

type Props = {
  session: Session;
};

const MyProfilePage: FC<Props> = async ({ session }) => {
  const userInfo = await api.user.getUserInfo({ userId: session.user.id });

  return (
    <Card disableHover className="mt-4 w-full max-w-screen-lg">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ProfileSummaryCardWrapper userInfo={userInfo}>
            <ProfileSummaryCard userInfo={userInfo} />
          </ProfileSummaryCardWrapper>

          <ProfileTabs session={session} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MyProfilePage;
