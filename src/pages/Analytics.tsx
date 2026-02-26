import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import {
    FolderOpen,
    Clock,
    CheckCircle2,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const projectStatusData = [
    { name: 'Draft', value: 4, color: '#94a3b8' },
    { name: 'U toku', value: 8, color: '#0ea5e9' },
    { name: 'Na pregledu', value: 3, color: '#f59e0b' },
    { name: 'Završeno', value: 12, color: '#10b981' },
    { name: 'Arhivirano', value: 2, color: '#6b7280' },
];

const sectionProgressData = [
    { name: 'Projekat A', odobreno: 8, na_pregledu: 2, u_toku: 3 },
    { name: 'Projekat B', odobreno: 5, na_pregledu: 4, u_toku: 4 },
    { name: 'Projekat C', odobreno: 12, na_pregledu: 1, u_toku: 0 },
    { name: 'Projekat D', odobreno: 3, na_pregledu: 2, u_toku: 8 },
    { name: 'Projekat E', odobreno: 7, na_pregledu: 3, u_toku: 3 },
];

const activityData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    approved: Math.floor(Math.random() * 5) + 2
}));

export default function Analytics() {
    const { setPageTitle } = useUIStore();
    const [stats, setStats] = useState({
        totalProjects: 0,
        awaitingApproval: 0,
        openTasks: 0
    });

    useEffect(() => {
        setPageTitle("Analitika");
        fetchStats();
    }, [setPageTitle]);

    const fetchStats = async () => {
        // In real app, fetch from Supabase
        // const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
        // const { count: sectionsCount } = await supabase.from('project_sections').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_approval');
        // const { count: tasksCount } = await supabase.from('collaboration_tasks').select('*', { count: 'exact', head: true }).eq('status', 'open');

        setStats({
            totalProjects: 29,
            awaitingApproval: 12,
            openTasks: 8
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Ukupno projekata", value: stats.totalProjects, icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Sekcije na čekanju", value: stats.awaitingApproval, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Otvoreni zadaci", value: stats.openTasks, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-bg-secondary rounded-2xl border border-border flex items-center gap-4"
                    >
                        <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            <h4 className="text-2xl font-bold">{stat.value}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Donut */}
                <div className="p-6 bg-bg-secondary rounded-2xl border border-border">
                    <h3 className="text-lg font-bold mb-6">Status projekata</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {projectStatusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Progress Bar Chart */}
                <div className="p-6 bg-bg-secondary rounded-2xl border border-border">
                    <h3 className="text-lg font-bold mb-6">Napredak po sekcijama (Top 5)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectionProgressData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="odobreno" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="na_pregledu" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="u_toku" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#10b981]" />
                            <span className="text-xs text-muted-foreground">Odobreno</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                            <span className="text-xs text-muted-foreground">Na pregledu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#0ea5e9]" />
                            <span className="text-xs text-muted-foreground">U toku</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="p-6 bg-bg-secondary rounded-2xl border border-border">
                <h3 className="text-lg font-bold mb-6">Aktivnost odobravanja (zadnjih 30 dana)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                            <Area
                                type="monotone"
                                dataKey="approved"
                                stroke="#0ea5e9"
                                fillOpacity={1}
                                fill="url(#colorApproved)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waiting for Me Table */}
                <div className="bg-bg-secondary rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold">Čeka se od mene</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Projekat</th>
                                    <th className="px-6 py-3 font-semibold">Sekcija</th>
                                    <th className="px-6 py-3 font-semibold">Radnja</th>
                                    <th className="px-6 py-3 font-semibold">Rok</th>
                                    <th className="px-6 py-3 font-semibold">Prioritet</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { project: "Eco Sarajevo", section: "Budžet", action: "Pregled", due: "Sutra", priority: "High", color: "text-red-500" },
                                    { project: "Velika aleja", section: "Ciljevi", action: "Dopuna", due: "24. Feb", priority: "Normal", color: "text-blue-500" },
                                    { project: "Reciklaža 2026", section: "Uvod", action: "Odobrenje", due: "26. Feb", priority: "Low", color: "text-emerald-500" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium">{row.project}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{row.section}</td>
                                        <td className="px-6 py-4 text-sm">{row.action}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{row.due}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`font-bold ${row.color}`}>{row.priority}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Next Step Table */}
                <div className="bg-bg-secondary rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold">Sljedeći korak</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Projekat</th>
                                    <th className="px-6 py-3 font-semibold">Sljedeći korak</th>
                                    <th className="px-6 py-3 font-semibold">Odgovorna osoba</th>
                                    <th className="px-6 py-3 font-semibold">Rok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { project: "Eco Sarajevo", step: "Potpisivanje", person: "Amir S.", due: "28. Feb" },
                                    { project: "Velika aleja", step: "Slanje donatoru", person: "Emina K.", due: "01. Mar" },
                                    { project: "Zeleni krovovi", step: "Izrada PDF-a", person: "AI Sistem", due: "Danas" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium">{row.project}</td>
                                        <td className="px-6 py-4 text-sm">{row.step}</td>
                                        <td className="px-6 py-4 text-sm flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {row.person.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            {row.person}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{row.due}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
