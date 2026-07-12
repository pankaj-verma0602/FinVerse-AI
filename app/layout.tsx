import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/firebase/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "FinVerse AI — AI-Powered Financial Literacy Suite",
  description: "Empower your financial future with FinVerse. Decode financial documents, simulate critical life scenarios, consult an AI money mentor, and identify scams instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-radial-gradient">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-grow flex flex-col">{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

