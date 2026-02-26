import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Plus,
    Clock,
    AlertCircle,
    MoreVertical,
    UserPlus,
    LayoutDashboard,
    Filter,
    CheckCircle2
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
    { id: 'open', title: 'Otvoreni', color: 'bg-slate-500' },
    { id: 'in_progress', title: 'U toku', color: 'bg-blue-500' },
    { id: 'review', title: 'Na pregledu', color: 'bg-amber-500' },
    { id: 'done', title: 'Završeni', color: 'bg-emerald-500' },
];

export default function Collaboration() {
    const { setPageTitle } = useUIStore();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle("Saradnja");
        fetchTasks();
    }, [setPageTitle]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('collaboration_tasks')
                .select('*, projects(title)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('collaboration_tasks')
                .update({ status: newStatus })
                .eq('id', taskId);

            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            toast.success("Status zadatka ažuriran");
        } catch (err) {
            toast.error("Greška pri ažuriranju statusa");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Saradnja</h1>
                    <p className="text-sm text-muted-foreground">Upravljajte timom, zadacima i pozivnicama</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <UserPlus className="h-4 w-4" /> Pozovi saradnika
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5" /> Novi zadatak
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4 bg-bg-secondary/50 rounded-2xl p-4 border border-border/50">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${col.color}`} />
                                <h3 className="font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground font-bold">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1 space-y-4">
                            <AnimatePresence>
                                {tasks
                                    .filter(t => t.status === col.id)
                                    .map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layoutId={task.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="p-4 bg-bg-secondary rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors group relative"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                                    task.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 text-xs">
                                                        <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'in_progress')}>Prebaci u 'U toku'</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'review')}>Prebaci u 'Pregled'</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'done')}>Prebaci u 'Završeno'</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-danger">Obriši</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <h4 className="text-sm font-bold mb-1 leading-tight">{task.title}</h4>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString('bs') : 'Bez roka'}
                                                </div>
                                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                    {task.assigned_to_profile?.full_name?.[0] || 'U'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
