import Link from "next/link";

import { auth } from "~/server/auth";

import HeaderClientButtons from "./headerClientButtons";

const Header = async () => {
  const session = await auth();

  return (
    <header className="absolute left-0 top-0 z-50 flex w-full px-12 py-4 transition-all duration-500">
      <div className="flex w-full items-center justify-between rounded-full bg-black/20 p-4 px-6 text-black backdrop-blur-sm transition-all duration-300 hover:bg-black/30 hover:backdrop-blur-md">
        <Link href="/">
          <h1 className="cursor-pointer text-2xl font-bold">Styran</h1>
        </Link>

        <div className="flex flex-1">
          <HeaderClientButtons session={session} />
        </div>
      </div>
    </header>
  );
};

export { Header };
