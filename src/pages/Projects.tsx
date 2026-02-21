import { motion } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const allProjects = [
  { title: "Zaštita rijeke Bosne — Faza II", donor: "Ambasada Švedske", status: "in_progress", progress: 62, dueDate: "15. mart 2026" },
  { title: "Edukacija mladih ronilaca", donor: "USAID BiH", status: "review", progress: 85, dueDate: "28. februar 2026" },
  { title: "Podvodna arheologija Neretve", donor: "EU IPA fondovi", status: "draft", progress: 15, dueDate: "10. april 2026" },
  { title: "Čišćenje Jadranskog primorja", donor: "Opština Neum", status: "completed", progress: 100, dueDate: "Završen" },
];

export default function Projects() {
  return (
    <AppShell title="Projekti">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži projekte..." className="pl-9 bg-muted/20 border-border" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 border-border">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Novi projekat
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allProjects.map((p) => (
            <ProjectCard key={p.title} {...p} />
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
