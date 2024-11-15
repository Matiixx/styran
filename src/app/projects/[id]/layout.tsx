import { Header } from "~/app/_components/header";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="bg-gradient-background flex h-screen flex-col items-center justify-center">
      <Header />
      {children}
    </main>
  );
}
