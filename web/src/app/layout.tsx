import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "my1040taxprep",
  description: "Prepare your 2023 federal tax return online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/2023" className="text-xl font-bold text-primary-700">
                my1040taxprep
              </a>
              <nav className="text-sm text-gray-600">
                2023 Tax Year
              </nav>
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
