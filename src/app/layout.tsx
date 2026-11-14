import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rosace: prepare the right conversations",
  description: "Matchmaking for City of Espoo recruitment events. We turn claims into questions you can check during the conversation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
