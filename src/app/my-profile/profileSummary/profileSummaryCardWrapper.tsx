"use client";

import { useState } from "react";

import { type UserRouterOutputs } from "~/server/api/routers/user";
import { Card, CardContent } from "~/components/ui/card";

import { EditButton, EditProfileForm } from "./editProfileSummary";

type ProfileSummaryCardWrapperProps = {
  userInfo: UserRouterOutputs["getUserInfo"];
  children: React.ReactNode;
};

const ProfileSummaryCardWrapper = ({
  userInfo,
  children,
}: ProfileSummaryCardWrapperProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card disableHover>
      <CardContent className="flex flex-col items-center gap-4">
        {isEditing ? (
          <EditProfileForm
            userInfo={userInfo}
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <>
            {children}
            <EditButton onEdit={() => setIsEditing(true)} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSummaryCardWrapper;
