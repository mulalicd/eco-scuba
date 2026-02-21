import { useState, useEffect } from "react";
import { Search, CheckCircle2, Loader2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RIPPhase() {
    const [complete, setComplete] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        "Legislativni okvir (BiH, Kantoni)",
        "Ekološki kontekst i statistika",
        "Demografska analiza ciljnih grupa",
        "Institucionalna mapa i resursi",
        "Finansijski standardi i tržne cijene"
    ];

    useEffect(() => {
        if (!complete) {
            const interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= steps.length - 1) {
                        clearInterval(interval);
                        setComplete(true);
                        setExpanded(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [complete, steps.length]);

    return (
        <div className="bg-bg-tertiary rounded-2xl border border-primary/20 overflow-hidden shadow-2xl shadow-primary/5">
            <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${complete ? 'bg-emerald-500/20' : 'bg-primary/20'}`}>
                        {complete ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Search className="h-6 w-6 text-primary animate-pulse" />}
                    </div>
                    <div>
                        <h3 className="font-bold">🔍 RIP Protokol — Istraživanje lokalnog konteksta</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                            {complete ? 'ISTRAŽIVANJE ZAVRŠENO' : 'ISTRAŽIVANJE U TOKU...'}
                        </p>
                    </div>
                </div>
                {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>

            <AnimatePresence>
                {(expanded || !complete) && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/5"
                    >
                        <div className="p-6 space-y-4">
                            {steps.map((step, i) => {
                                const isCurrent = i === currentStep;
                                const isFinished = i < currentStep || complete;
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0`}>
                                            {isFinished ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : isCurrent ? (
                                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-slate-700" />
                                            )}
                                        </div>
                                        <span className={`text-sm ${isFinished ? 'text-foreground' : isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                            {step} {isFinished && '✓'}
                                        </span>
                                    </div>
                                );
                            })}

                            {complete && (
                                <div className="mt-6 p-4 bg-bg-surface rounded-xl border border-border border-l-4 border-l-emerald-500">
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase mb-2">
                                        <Info className="h-4 w-4" /> RIP Istraživački Sažetak
                                    </div>
                                    <p className="text-xs text-text-dim leading-relaxed">
                                        Uspješno prikupljeni podaci o relevantnim zakonima o sportu i okolišu u FBiH,
                                        statistikama zagađenja rijeka za 2024. godinu, te demografiji mladih u Kantonu Sarajevo.
                                        Ovi podaci će biti korišteni za argumentaciju u svim sekcijama projekta.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
