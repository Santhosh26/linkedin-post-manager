// src/app/dashboard/layout.tsx (This is a Server Component by default)
import { auth } from "@/lib/auth"; // Import server-side auth function
import { redirect } from "next/navigation";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout"; // Import the client part
import { Card } from "@/components/ui/cardAdapter"; // Import Card if you want the wrapping here

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // Check session on the server

  if (!session?.user) {
    // If no session, redirect to login immediately on the server
    // Pass the intended destination as callbackUrl
    redirect('/login?callbackUrl=/dashboard');
  }

  // If authenticated, render the client layout wrapper
  // We can wrap the children in the Card here if it was removed from the client layout
  return (
    <ClientDashboardLayout>
      <Card className="bg-card text-card-foreground rounded-lg shadow p-6">
        {children}
      </Card>
    </ClientDashboardLayout>
  );
}