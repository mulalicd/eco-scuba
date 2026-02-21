import { motion } from "framer-motion";
import { FolderOpen, CheckCircle, ListTodo, Clock, ArrowRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/button";

const mockProjects = [
  { title: "Zastita rijeke Bosne - Faza II", donor: "Ambasada Svedske", status: "in_progress" as const, progress: 62, dueDate: "15. mart 2026" },
  { title: "Edukacija mladih ronilaca", donor: "USAID BiH", status: "review" as const, progress: 85, dueDate: "28. februar 2026" },
  { title: "Podvodna arheologija Neretve", donor: "EU IPA fondovi", status: "draft" as const, progress: 15, dueDate: "10. april 2026" },
];

const mockActivity = [
  { text: 'Sekcija "Budzet" odobrena', project: "Zastita rijeke Bosne", time: "Prije 2 sata" },
  { text: "Novi saradnik pridruzen", project: "Edukacija mladih ronilaca", time: "Prije 5 sati" },
  { text: "PDF generisan i preuzet", project: "Zastita rijeke Bosne", time: "Jucer" },
  { text: 'Sekcija "Aktivnosti" napisana', project: "Podvodna arheologija Neretve", time: "Jucer" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={FolderOpen} label="Aktivni projekti" value={3} trend="+1 ovaj mjesec" variant="primary" />
          <StatCard icon={CheckCircle} label="Čeka odobrenje" value={4} variant="warning" />
          <StatCard icon={ListTodo} label="Moji zadaci" value={7} variant="default" />
        </motion.div>

        {/* Projects + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects */}
          <motion.div variants={item} className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Moji projekti</h2>
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                Vidi sve <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockProjects.map((p) => (
                <ProjectCard key={p.title} {...p} />
              ))}
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div variants={item} className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Aktivnost</h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-4" style={{ boxShadow: "var(--shadow-sm)" }}>
              {mockActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.project} · {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tasks */}
            <h2 className="font-display text-lg font-semibold text-foreground pt-2">Zadaci koji čekaju</h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3" style={{ boxShadow: "var(--shadow-sm)" }}>
              {[
              { text: 'Odobriti sekciju "Budzet"', priority: "urgent", due: "Prekoracen" },
                { text: 'Pregledati "Aktivnosti"', priority: "high", due: "Danas" },
                { text: "Dostaviti podatke o budzetu", priority: "normal", due: "Sutra" },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    task.priority === "urgent" ? "bg-destructive" :
                    task.priority === "high" ? "bg-warning" : "bg-primary"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{task.text}</p>
                  </div>
                  <span className={`text-xs shrink-0 ${
                    task.priority === "urgent" ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    <Clock className="inline h-3 w-3 mr-0.5" />{task.due}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
