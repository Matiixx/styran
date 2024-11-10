import Link from "next/link";

import { auth } from "~/server/auth";

import HeaderClientButtons from "./headerClientButtons";

const Header = async () => {
  const session = await auth();

  return (
    <header className="absolute left-0 top-0 flex w-full px-12 py-4 transition-all duration-500 hover:pt-5">
      <div className="flex w-full items-center justify-between rounded-full bg-white/20 p-4 px-6 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:backdrop-blur-md">
        <Link href="/">
          <h1 className="cursor-pointer text-2xl font-bold">Styran</h1>
        </Link>

        <div>
          <HeaderClientButtons session={session} />
        </div>
      </div>
    </header>
  );
};

export { Header };
