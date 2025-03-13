"use client";
import { type Session } from "next-auth";

import { Briefcase, CalendarCheck2, MapPin } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { UserAvatar } from "../_components/UserAvatar";
import { Button } from "~/components/ui/button";

type ProfileSummaryCardProps = {
  session: Session;
};

const ProfileSummaryCard = ({ session }: ProfileSummaryCardProps) => {
  return (
    <Card disableHover>
      <CardContent className="flex flex-col items-center gap-4">
        <UserAvatar className="h-20 w-20 text-3xl" user={session.user} />
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold">
            {session.user.firstName} {session.user.lastName}
          </h2>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>

        <div className="flex w-full flex-col justify-start gap-4">
          <div className="flex flex-row items-center gap-2">
            <MapPin className="text-gray-500" size={18} />
            <span className="text-sm">Warsaw, Poland</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Briefcase className="text-gray-500" size={18} />
            <span className="text-sm">Software Engineer</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <CalendarCheck2 className="text-gray-500" size={18} />
            <span className="text-sm">Joined 12/12/2024</span>
          </div>
        </div>

        <Button variant="default" className="mt-4 w-full">
          Edit Profile Info
        </Button>
      </CardContent>
    </Card>
  );
};

export { ProfileSummaryCard };
