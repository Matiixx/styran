import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

import { auth } from "~/server/auth";
import { Header } from "~/app/_components/header";
import { api } from "~/trpc/server";

export default async function Home({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const session = await auth();
  const code = (await _searchParams).code;

  if (!session?.user) {
    redirect("/");
  }

  if (!code) {
    redirect("/my-profile");
  }

  await api.integrations.googleCalendarRedirect({ code }).then(() => {
    redirect("/my-profile");
  });

  return (
    <SessionProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="flex w-full flex-col items-center px-4 py-16 pt-24">
            Loading...
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}

export const metadata = {
  title: "My Profile",
};
