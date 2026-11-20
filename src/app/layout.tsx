import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IRTTAA NuzhAI | Alumni Meet Event Management",
  description:
    "Modern event check-in, on-spot walk-in registration, and analytics portal for IRTT Alumni Association.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-teal-500/20 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
