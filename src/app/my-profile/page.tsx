import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

import { auth } from "~/server/auth";

import { Header } from "../_components/header";
import MyProfilePage from "./myProfilePage";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <SessionProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="flex w-full flex-col items-center px-4 py-16 pt-24">
            <MyProfilePage session={session} />
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
