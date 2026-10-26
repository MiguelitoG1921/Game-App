import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little Life — One Little World",
  description: "A quiet little life in a clearing. Keep an eye on hunger, sleep, and the food stockpile.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
