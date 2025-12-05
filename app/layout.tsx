import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Energy Plan Recommendation Agent",
  description: "AI-powered energy plan recommendations for Texas residential customers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

