import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopNav from "./TopNav";

interface AppShellProps {
  children: ReactNode;
  title: string;
}

export default function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-[72px] md:pl-[260px] transition-all duration-300">
        <TopNav title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
