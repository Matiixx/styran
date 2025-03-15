"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

import { MapPin, Briefcase, CalendarCheck2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { type UserRouterOutputs } from "~/server/api/routers/user";
import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { UserAvatar } from "~/app/_components/UserAvatar";

type EditButtonProps = {
  onEdit: () => void;
};

const EditButton = ({ onEdit }: EditButtonProps) => {
  return (
    <Button variant="default" className="mt-4 w-full" onClick={onEdit}>
      Edit Profile Info
    </Button>
  );
};

type EditProfileFormProps = {
  userInfo: UserRouterOutputs["getUserInfo"];
  onClose: () => void;
};

const EditProfileForm = ({ userInfo, onClose }: EditProfileFormProps) => {
  const locationRef = useRef<HTMLInputElement>(null);
  const jobTitleRef = useRef<HTMLInputElement>(null);
  const navigate = useRouter();

  const { mutateAsync: updateUserInfo } = api.user.updateUserInfo.useMutation({
    onSuccess: () => {
      return navigate.refresh();
    },
  });

  const onSave = () => {
    return updateUserInfo({
      location: locationRef.current?.value,
      jobTitle: jobTitleRef.current?.value,
    })
      .then(() => {
        toast("Profile updated");
        onClose();
      })
      .catch(() => {
        toast.error("Failed to update profile");
      });
  };

  return (
    <>
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
          <Input
            type="text"
            className="h-6 w-full"
            ref={locationRef}
            defaultValue={userInfo.location ?? ""}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <Briefcase className="text-gray-500" size={18} />
          <Input
            type="text"
            className="h-6 w-full"
            ref={jobTitleRef}
            defaultValue={userInfo.jobTitle ?? ""}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <CalendarCheck2 className="text-gray-500" size={18} />
          <span className="text-sm">
            Joined {format(userInfo.createdAt, "dd/MM/yyyy")}
          </span>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="default" className="mt-4 w-full" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" className="mt-4 w-full" onClick={onSave}>
          Save
        </Button>
      </div>
    </>
  );
};

export { EditButton, EditProfileForm };
