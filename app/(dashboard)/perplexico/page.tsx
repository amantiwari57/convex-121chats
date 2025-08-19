"use client";

import PerplexicoChat from "@/components/components/PerplexicoChat";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";


export default function PerplexicoPage() {
  const { user, isLoaded } = useUser();

  if (isLoaded && !user) {
    redirect("/auth/signin");
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <PerplexicoChat />;
}
