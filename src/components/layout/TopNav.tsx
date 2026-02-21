import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface TopNavProps {
  title: string;
}

export default function TopNav({ title }: TopNavProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži projekte..."
            className="w-64 pl-9 bg-muted/30 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Notifikacije"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
        </button>

        {/* New project */}
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => navigate("/projects/new")}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novi projekat</span>
        </Button>
      </div>
    </header>
  );
}
