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
        <div className="bg-bg-tertiary/40 backdrop-blur-xl rounded-3xl border border-brand/20 overflow-hidden shadow-2xl shadow-brand/5">
            <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all duration-300"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-5">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${complete ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-brand/10 border border-brand/20'}`}>
                        {complete ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Search className="h-6 w-6 text-brand animate-pulse" />}
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-base text-text-primary tracking-tight">RIP Protokol — Istraživanje lokalnog konteksta (v3)</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${complete ? 'text-emerald-500' : 'text-brand animate-pulse'}`}>
                            {complete ? 'ISTRAŽIVANJE ZAVRŠENO' : `ISTRAŽIVANJE DOMENE ${currentStep + 1}/6...`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-text-dim font-bold uppercase tracking-widest leading-none">Status Autonomije</div>
                        <div className="text-[11px] text-text-primary font-bold">Visok (Level 4)</div>
                    </div>
                    {expanded ? <ChevronUp className="h-5 w-5 text-text-dim" /> : <ChevronDown className="h-5 w-5 text-text-dim" />}
                </div>
            </div>

            <AnimatePresence>
                {(expanded || !complete) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden border-t border-white/5"
                    >
                        <div className="p-8 space-y-5">
                            {steps.map((step, i) => {
                                const isCurrent = i === currentStep;
                                const isFinished = i < currentStep || complete;
                                return (
                                    <div key={i} className="flex items-center gap-4 transition-all duration-300">
                                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-500 ${isFinished ? 'bg-emerald-500/20 border-emerald-500/30' : isCurrent ? 'bg-brand/20 border-brand/30 ring-2 ring-brand/20' : 'bg-white/5 border-white/10'}`}>
                                            {isFinished ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : isCurrent ? (
                                                <Loader2 className="h-4 w-4 text-brand animate-spin" />
                                            ) : (
                                                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm tracking-tight transition-all duration-300 ${isFinished ? 'text-text-primary' : isCurrent ? 'text-brand font-bold' : 'text-text-dim'}`}>
                                                {step}
                                            </span>
                                            {isCurrent && !complete && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-[10px] text-brand/60 font-medium italic mt-0.5"
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
                                    className="mt-8 p-5 bg-bg-surface/50 rounded-2xl border border-white/10 border-l-4 border-emerald-500/50"
                                >
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest mb-3">
                                        <Info className="h-3.5 w-3.5" /> RIP Istraživački Paket — Verifikovano
                                    </div>
                                    <p className="text-[12px] text-text-dim leading-relaxed">
                                        RIP protokol je uspješno prikupio i klasificirao podatke za svih 6 domena.
                                        Identifikovano je 14 [VERIFICIRAN] izvora (uključujući Zakon o vodama FBiH i FHMZ statistike)
                                        i 5 [INDICIRAN] trendova. Praznine podataka su označene kao [PODATAK NEDOSTAJE]
                                        te će WA protokol koristiti specifično uokvirivanje u tim sekcijama.
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
