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

const getUserInfo = async (userId: string) => {
  const userInfo = await api.user.getUserInfo({ userId }).catch((error) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      return null;
    }
    throw error;
  });

  return {
    userInfo,
    isError: userInfo ? false : true,
  };
};

const UserProfile = async ({ userId }: UserPageComponentProps) => {
  const { userInfo, isError } = await getUserInfo(userId);

  if (isError) {
    return (
      <Card disableHover className="col-span-3 mt-4 w-full max-w-screen-lg">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="font-bold">User not found</div>
          <GoToHomeButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <UserSummaryCardServer userInfo={userInfo} />
      <UserBio firstName={userInfo!.firstName} bio={userInfo!.bio} />
    </>
  );
};

const UserPageComponent = ({ userId }: UserPageComponentProps) => {
  return (
    <Card disableHover className="mt-4 w-full max-w-screen-lg">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Suspense
            fallback={
              <>
                <UserSummaryCardServer userInfo={null} />
                <UserBio firstName={null} bio={null} />
              </>
            }
          >
            <UserProfile userId={userId} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPageComponent;
