import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FolderOpen, BarChart2, Users, Settings, LogOut } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projekti' },
    { to: '/analytics', icon: BarChart2, label: 'Analitika' },
    { to: '/collaboration', icon: Users, label: 'Saradnja' },
    { to: '/settings', icon: Settings, label: 'Podešavanja' },
];

export function Sidebar() {
    const { sidebarOpen: sidebarExpanded, setSidebarOpen: setSidebarExpanded } = useUIStore();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email ?? null);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarExpanded ? 256 : 64 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-full bg-bg-secondary border-r border-[var(--border)]
                 flex flex-col z-40 overflow-hidden"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)]">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/5">
                    <img
                        src="https://i.postimg.cc/Z5PkMvVq/KVS-SCUBA-LOGO.png"
                        alt="ECO SCUBA Logo"
                        className="w-full h-full object-contain p-1"
                    />
                </div>
                <AnimatePresence>
                    {sidebarExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                        >
                            <p className="font-display font-bold text-text-primary text-sm leading-tight">
                                ECO SCUBA
                            </p>
                            <p className="text-text-dim text-xs">KVS S.C.U.B.A.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        title={!sidebarExpanded ? label : undefined}
                        className={({ isActive }) => cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                            isActive
                                ? 'bg-brand/15 text-brand border-l-2 border-brand'
                                : 'text-text-muted hover:bg-bg-tertiary hover:text-text-primary border-l-2 border-transparent'
                        )}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <AnimatePresence>
                            {sidebarExpanded && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm font-medium whitespace-nowrap"
                                >
                                    {label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-2 py-3 border-t border-[var(--border)]">
                <div className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg',
                    !sidebarExpanded && 'justify-center'
                )}>
                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center
                          text-brand text-xs font-bold flex-shrink-0">
                        {userEmail?.[0].toUpperCase() ?? 'U'}
                    </div>
                    <AnimatePresence>
                        {sidebarExpanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-text-primary text-xs font-medium truncate">
                                    {userEmail ?? ''}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleLogout}
                        title="Odjava"
                        className="text-text-dim hover:text-danger transition-colors flex-shrink-0 ml-auto"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}
