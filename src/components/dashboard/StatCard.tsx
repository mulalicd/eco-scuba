import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  variant?: "default" | "primary" | "warning";
}

const variantStyles = {
  default: "border-border hover:border-primary/30",
  primary: "border-primary/20 hover:border-primary/40",
  warning: "border-warning/20 hover:border-warning/40",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
};

export default function StatCard({ icon: Icon, label, value, trend, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl border bg-card p-5 transition-all duration-300 ${variantStyles[variant]}`}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-xs text-success font-medium">{trend}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </motion.div>
  );
}
