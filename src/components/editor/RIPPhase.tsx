import { useState, useEffect } from "react";
import { Search, CheckCircle2, Loader2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RIPPhase() {
    const [complete, setComplete] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        "Legislativni i strateški okvir (BiH)",
        "Geografski i ekološki kontekst projektne lokacije",
        "Demografski i socioekonomski profil zajednice",
        "Institucionalna mapa i potencijalna saradnja",
        "Analiza sličnih projekata i najboljih praksi",
        "Podaci o sektoru vodenih sportova i eko-edukacije"
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
            }, 1200);
            return () => clearInterval(interval);
        }
    }, [complete, steps.length]);

    return (
        <div className="bg-muted/30 backdrop-blur-xl rounded-3xl border border-primary/20 overflow-hidden shadow-2xl">
            <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-all duration-300"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-5">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${complete ? 'bg-success/10 border border-success/20' : 'bg-primary/10 border border-primary/20'}`}>
                        {complete ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Search className="h-6 w-6 text-primary animate-pulse" />}
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-base text-foreground tracking-tight">RIP Protokol — Istraživanje lokalnog konteksta</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${complete ? 'text-success' : 'text-primary animate-pulse'}`}>
                            {complete ? 'ISTRAŽIVANJE ZAVRŠENO' : `ISTRAŽIVANJE DOMENE ${currentStep + 1}/6...`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Status</div>
                        <div className="text-[11px] text-foreground font-bold">Visok (Level 4)</div>
                    </div>
                    {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
            </div>

            <AnimatePresence>
                {(expanded || !complete) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden border-t border-border"
                    >
                        <div className="p-8 space-y-5">
                            {steps.map((step, i) => {
                                const isCurrent = i === currentStep;
                                const isFinished = i < currentStep || complete;
                                return (
                                    <div key={i} className="flex items-center gap-4 transition-all duration-300">
                                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-500 ${isFinished ? 'bg-success/20 border-success/30' : isCurrent ? 'bg-primary/20 border-primary/30 ring-2 ring-primary/20' : 'bg-muted border-border'}`}>
                                            {isFinished ? (
                                                <CheckCircle2 className="h-4 w-4 text-success" />
                                            ) : isCurrent ? (
                                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                            ) : (
                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm tracking-tight transition-all duration-300 ${isFinished ? 'text-foreground' : isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                                {step}
                                            </span>
                                            {isCurrent && !complete && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-[10px] text-primary/60 font-medium italic mt-0.5"
                                                >
                                                    Analiziram zakonske i strateške baze podataka...
                                                </motion.span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {complete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-5 bg-muted/30 rounded-2xl border border-border border-l-4 border-l-success/50"
                                >
                                    <div className="flex items-center gap-2 text-success font-bold text-[10px] uppercase tracking-widest mb-3">
                                        <Info className="h-3.5 w-3.5" /> RIP Istraživački Paket — Verifikovano
                                    </div>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                                        RIP protokol je uspješno prikupio i klasificirao podatke za svih 6 domena.
                                        Identifikovano je 14 [VERIFICIRAN] izvora i 5 [INDICIRAN] trendova.
                                        Praznine podataka su označene kao [PODATAK NEDOSTAJE].
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
