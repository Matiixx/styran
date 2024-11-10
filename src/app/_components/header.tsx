import Link from "next/link";

const Header = () => {
  return (
    <header className="absolute left-0 top-0 flex h-16 w-full items-center justify-between bg-gradient-to-b from-white/30 to-white/5 px-4 text-white">
      <Link href="/">
        <h1 className="cursor-pointer text-2xl font-bold">Styran</h1>
      </Link>
    </header>
  );
};

export { Header };
