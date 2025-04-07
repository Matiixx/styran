import { Header } from "~/app/_components/header";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-white">
      <Header />
      {children}
    </main>
  );
}
