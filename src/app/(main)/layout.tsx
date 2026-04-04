import { TopHeader, BottomNavigation } from "@/components/dashboard/Navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-pink-50/60">
      <TopHeader />
      <main className="flex-1 container mx-auto px-4 py-4 max-w-3xl pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
