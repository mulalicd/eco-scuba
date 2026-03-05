import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
    Check,
    Layout,
    ShieldCheck,
    Zap,
    Download,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    sections: any[];
    onComplete: () => void;
    onCancel: () => void;
}

const FinalAssemblyModal = forwardRef<HTMLDivElement, Props>(({ sections, onComplete, onCancel }, ref) => {
    const [assembling, setAssembling] = useState(true);
    const [currentCheck, setCurrentCheck] = useState(0);

    const checks = [
        "Provjera konzistentnosti svih numeričkih podataka (budžet, korisnici)",
        "Sinhronizacija lokacija i koordinate kroz cijeli dokument",
        "Provjera vremenskog okvira i faza projekta",
        "Verifikacija svih zakonskih referenci i RIP izvora",
        "Standardizacija terminologije i 'tone-of-voice'",
        "Validacija HTML strukture prema obrascu donatora",
        "Generisanje automatske liste aneksa"
    ];

    useEffect(() => {
        if (assembling) {
            const interval = setInterval(() => {
                setCurrentCheck(prev => {
                    if (prev >= checks.length - 1) {
                        clearInterval(interval);
                        setAssembling(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [assembling, checks.length]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl"
        >
            <div className="w-full max-w-2xl bg-card rounded-[40px] border border-border shadow-[0_32px_128px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-10 border-b border-border bg-muted/20 text-center">
                    <div className="h-20 w-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
                        <Layout className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-foreground">Finalno Asembliranje</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        APA sistem vrši završnu 7-stepenu provjeru konzistentnosti prije generisanja finalnog projektnog prijedloga.
                    </p>
                </div>

                {/* Progress */}
                <div className="flex-1 p-10 space-y-4">
                    <div className="space-y-3">
                        {checks.map((check, i) => {
                            const isCurrent = i === currentCheck && assembling;
                            const isDone = i < currentCheck || !assembling;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${isCurrent ? 'bg-primary/5 border-primary/30 shadow-lg' : isDone ? 'bg-success/5 border-success/20' : 'bg-muted/10 border-border opacity-50'}`}
                                >
                                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all duration-500 ${isDone ? 'bg-success text-success-foreground border-success' : isCurrent ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-border'}`}>
                                        {isDone ? <Check className="h-4 w-4" /> : isCurrent ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                    </div>
                                    <span className={`text-[13px] font-bold tracking-tight ${isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {check}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-border bg-muted/20 flex flex-col items-center">
                    {!assembling ? (
                        <div className="space-y-8 w-full">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-[0.2em] border border-success/20 mb-2">
                                    <ShieldCheck className="h-3 w-3" /> Verificirano
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Finalni projektni prijedlog je asembliran. Uključuje {sections.length} sekcija.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={onCancel} className="flex-1 h-14 rounded-2xl border-border font-bold">
                                    Nazad u editor
                                </Button>
                                <Button onClick={onComplete} className="flex-1 h-14 rounded-2xl shadow-2xl shadow-primary/30 font-bold gap-3">
                                    Preuzmi Projekat <Download className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-primary">
                            <Zap className="h-5 w-5 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">APA State Processor Active...</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

FinalAssemblyModal.displayName = 'FinalAssemblyModal';

export default FinalAssemblyModal;
