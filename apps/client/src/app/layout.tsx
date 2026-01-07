import "./global.css";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { AuthProvider } from "../context/auth-context";
import { NotificationProvider } from "../context/notification-context";
import { Toaster } from "sonner";
import { getServerUser } from "../lib/auth/session";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser().catch(() => null);

  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <AuthProvider initialUser={user}>
            <NotificationProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto py-6 px-4">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster position="top-center" richColors />
            </NotificationProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
