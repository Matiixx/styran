import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { Header } from "~/app/_components/header";

import UserPageComponent from "./userPage";

type UserProfilePageProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserProfilePage(props: UserProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const userId = (await props.params).userId;

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <Header />
      <div className="flex w-full flex-1 flex-col items-center gap-12 overflow-y-scroll px-4 py-16 pt-24">
        <UserPageComponent userId={userId} />
      </div>
    </main>
  );
}
