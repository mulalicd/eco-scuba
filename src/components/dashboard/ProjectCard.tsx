import { motion } from "framer-motion";
import { Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  title: string;
  donor: string;
  status: string;
  progress: number;
  dueDate: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
};

const statusLabels: Record<string, string> = {
  draft: "Nacrt",
  in_progress: "U toku",
  review: "Pregled",
  completed: "Završen",
};

export default function ProjectCard({ title, donor, status, progress, dueDate }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{donor}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[status] || statusColors.draft}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Napredak sekcija</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>{dueDate}</span>
      </div>
    </motion.div>
  );
}
