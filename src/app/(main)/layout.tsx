import { Navigation } from "@/components/dashboard/Navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-4 max-w-3xl">
        {children}
      </main>
    </div>
  );
}
