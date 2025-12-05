import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Energy Plan Recommendation Agent",
  description: "AI-powered energy plan recommendations for Texas residential customers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EnergyPlan",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Energy Plan Recommendation Agent",
    title: "Energy Plan Recommendation Agent",
    description: "AI-powered energy plan recommendations for Texas residential customers",
  },
  twitter: {
    card: "summary",
    title: "Energy Plan Recommendation Agent",
    description: "AI-powered energy plan recommendations for Texas residential customers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <InstallPrompt />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}

