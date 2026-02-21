import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';

const data = [
    { name: 'Naslovna', progress: 100 },
    { name: 'Uvod', progress: 100 },
    { name: 'Budžet', progress: 60 },
    { name: 'Aktivnosti', progress: 40 },
    { name: 'Ciljevi', progress: 80 },
    { name: 'Rezultati', progress: 30 },
];

export default function ProjectProgressChart() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-[300px] rounded-2xl bg-bg-surface border border-white/5 p-6 shadow-xl"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-text-primary">Napredak po sekcijama</h3>
                <div className="text-xs text-text-muted">Projekat: Zaštita rijeke Bosne</div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#4d7094', fontSize: 12 }}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#4d7094', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{
                            backgroundColor: '#162340',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px'
                        }}
                    />
                    <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.progress === 100 ? '#10b981' : '#0ea5e9'}
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
