import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "../components/ConvexClientProvider";
import { ClerkProvider } from '@clerk/nextjs'

const geist = Geist({
  variable: "--geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatApp",
  description: "Real-time chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          signInUrl="/auth/signin"
          signUpUrl="/auth/signup"
          afterSignInUrl="/chat"
          afterSignUpUrl="/chat"
          appearance={{
            variables: {
              colorPrimary: '#2563eb'
            }
          }}
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
