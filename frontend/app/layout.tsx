// app/layout.tsx
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "LMS App",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}