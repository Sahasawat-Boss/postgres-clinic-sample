import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import { Spinner } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense>
        <Sidebar />
      </Suspense>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<Spinner />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
