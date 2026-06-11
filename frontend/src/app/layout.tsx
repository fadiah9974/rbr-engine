import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "RBR Engine",
  description: "Dashboard RBR Engine",
  icons: {
    icon: "/Logo_RBR_Engine.png",
    shortcut: "/Logo_RBR_Engine.png",
    apple: "/Logo_RBR_Engine.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
