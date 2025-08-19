"use client";

import {
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="w-full h-full">
        {children}
      </div>
    </SidebarProvider>
  );
}
