import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import NewProjectWizard from "../projects/NewProjectWizard";

interface TopNavProps {
  title: string;
}

export default function TopNav({ title }: TopNavProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <h1 className="font-display text-xl font-bold text-foreground truncate max-w-[400px]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži..."
            className="w-48 xl:w-64 pl-9 bg-muted/20 border-border focus:border-primary/50 transition-all rounded-xl h-10"
          />
        </div>

        <ThemeToggle />
        <NotificationBell />

        <Button
          size="sm"
          className="gap-2 rounded-xl h-10 px-4 shadow-lg shadow-primary/20"
          onClick={() => setWizardOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novi projekat</span>
        </Button>
      </div>

      <NewProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </header>
  );
}
