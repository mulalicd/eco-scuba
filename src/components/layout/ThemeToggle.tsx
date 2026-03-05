import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return true;
        const stored = localStorage.getItem('eco-scuba-theme');
        if (stored) return stored === 'dark';
        return true; // default dark
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('eco-scuba-theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('eco-scuba-theme', 'light');
        }
    }, [isDark]);

    // Initialize on mount
    useEffect(() => {
        const stored = localStorage.getItem('eco-scuba-theme');
        if (stored === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
            title={isDark ? 'Prebaci na svijetli režim' : 'Prebaci na tamni režim'}
        >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
    );
}
