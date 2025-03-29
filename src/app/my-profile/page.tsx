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
      <main className="bg-gradient-background flex h-screen flex-col items-center justify-center">
        <Header />
        <div className="flex w-full flex-1 flex-col items-center gap-12 overflow-y-scroll px-4 py-16 pt-24">
          <MyProfilePage session={session} />
        </div>
      </main>
    </SessionProvider>
  );
}
