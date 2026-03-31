import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Scripture — KJV Bible Verses",
  description:
    "An interactive experience featuring King James Version Bible verses with a beautiful animated background.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
