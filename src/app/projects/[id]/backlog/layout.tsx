export default async function BacklogLayout({
  task,
  children,
}: Readonly<{
  task: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      {task}
    </>
  );
}
