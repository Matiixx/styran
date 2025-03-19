import { Suspense } from "react";
import { TRPCError } from "@trpc/server";

import { api } from "~/trpc/server";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { UserSummaryCardServer } from "./userSummaryCard";
import { GoToHomeButton } from "./goToHomeButton";
import UserBio from "./userBio";

type UserPageComponentProps = {
  userId: string;
};

const UserProfile = async ({ userId }: UserPageComponentProps) => {
  const userInfo = await api.user.getUserInfo({ userId }).catch((error) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      return null;
    }
    throw error;
  });

  if (!userInfo) {
    return (
      <Card disableHover className="mt-4 w-full max-w-screen-lg">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="font-bold">User not found</div>
          <GoToHomeButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card disableHover className="mt-4 w-full max-w-screen-lg">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {userInfo && (
            <>
              <UserSummaryCardServer userInfo={userInfo} />
              <UserBio firstName={userInfo.firstName} bio={userInfo.bio} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UserPageComponent = ({ userId }: UserPageComponentProps) => {
  return (
    <Suspense
      fallback={
        <Card disableHover className="mt-4 w-full max-w-screen-lg">
          <CardContent>
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      }
    >
      <UserProfile userId={userId} />
    </Suspense>
  );
};

export default UserPageComponent;
