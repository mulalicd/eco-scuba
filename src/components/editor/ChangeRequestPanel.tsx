import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    ArrowRight,
    Check,
    AlertCircle,
    Zap,
    Layers,
    RefreshCw,
    ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    sectionTitle: string;
    onApply: (changeDescription: string) => void;
    onCancel: () => void;
}

type Step = 'input' | 'analysis' | 'elaboration' | 'confirmation' | 'applying';

export default function ChangeRequestPanel({ sectionTitle, onApply, onCancel }: Props) {
    const [step, setStep] = useState<Step>('input');
    const [request, setRequest] = useState("");

    // Simulated APA Analysis data
    const [analysis, setAnalysis] = useState("");
    const [elaboration, setElaboration] = useState("");

    const handleNext = () => {
        if (step === 'input') {
            setStep('analysis');
            // Simulate analysis phase
            setTimeout(() => {
                setAnalysis(`Izmjena utiče na terminologiju u sekciji "${sectionTitle}" i potencijalno na budžetske stavke u sekciji "Budžet".`);
                setStep('elaboration');
            }, 1500);

            setTimeout(() => {
                setElaboration(`Planiram korigirati ciljne grupe i osigurati da se novi podaci propagiraju kroz cijeli dokument prema [FIX-06] protokolu.`);
                setStep('confirmation');
            }, 3000);
        } else if (step === 'confirmation') {
            setStep('applying');
            setTimeout(() => {
                onApply(request);
            }, 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm"
        >
            <div className="w-full max-w-2xl bg-bg-secondary rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-bg-tertiary/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                            <RefreshCw className={`h-6 w-6 text-brand ${step === 'analysis' || step === 'elaboration' || step === 'applying' ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">APA Protokol Izmjene [FIX-06]</h2>
                            <p className="text-xs text-text-dim font-bold uppercase tracking-widest mt-1">
                                {sectionTitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-brand/5 rounded-2xl border border-brand/10">
                                    <p className="text-sm text-brand font-medium leading-relaxed">
                                        Opišite što želite promijeniti u ovoj sekciji. APA će analizirati zahtjev,
                                        elaborirati implikacije i zatražiti vašu finalnu potvrdu prije primjene.
                                    </p>
                                </div>
                                <Textarea
                                    autoFocus
                                    placeholder="npr. Promijeni broj učesnika na 50 i dodaj fokus na ekologiju podmorja..."
                                    className="min-h-[160px] bg-bg-surface border-white/5 focus:border-brand/50 text-base p-6 rounded-2xl"
                                    value={request}
                                    onChange={(e) => setRequest(e.target.value)}
                                />
                            </motion.div>
                        )}

                        {(step === 'analysis' || step === 'elaboration' || step === 'confirmation' || step === 'applying') && (
                            <motion.div
                                key="process"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Step 1: Analysis */}
                                <div className={`p-6 rounded-2xl border transition-all duration-500 ${step === 'analysis' ? 'bg-brand/5 border-brand/30 ring-2 ring-brand/10' : 'bg-bg-tertiary/50 border-white/5 opacity-50'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-bg-surface border border-white/10 flex items-center justify-center font-bold text-xs">1</div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest">Analiza Zahtjeva</h4>
                                    </div>
                                    <p className="text-sm text-text-primary leading-relaxed">
                                        {analysis || "APA analizira logičke implikacije izmjene..."}
                                    </p>
                                </div>

                                {/* Step 2: Elaboration */}
                                <div className={`p-6 rounded-2xl border transition-all duration-500 ${step === 'elaboration' ? 'bg-brand/5 border-brand/30 ring-2 ring-brand/10' : 'bg-bg-tertiary/50 border-white/5 opacity-50'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-bg-surface border border-white/10 flex items-center justify-center font-bold text-xs">2</div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest">Elaboracija i Planiranje</h4>
                                    </div>
                                    <p className="text-sm text-text-primary leading-relaxed">
                                        {elaboration || "Planiram optimalnu implementaciju vašeg zahtjeva..."}
                                    </p>
                                </div>

                                {/* Step 3: Confirmation */}
                                {step === 'confirmation' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5"
                                    >
                                        <div className="flex gap-4">
                                            <ShieldAlert className="h-6 w-6 text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-emerald-500 mb-2">POTVRDA PRIMJENE</p>
                                                <p className="text-sm text-text-primary leading-relaxed italic">
                                                    "Razumijem vašu izmjenu. Planiram je primijeniti na opisani način.
                                                    Ova izmjena će biti automatski propagirana kroz sve povezane sekcije projekta.
                                                    Da li odobravate ovu interpretaciju?"
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'applying' && (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <RefreshCw className="h-10 w-10 text-brand animate-spin" />
                                        <p className="text-sm font-bold text-brand animate-pulse uppercase tracking-[0.2em]">Primjenjujem izmjene i vršim globalnu propagaciju...</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-white/5 bg-bg-tertiary/20 flex items-center justify-between">
                    <Button variant="ghost" onClick={onCancel} className="gap-2 text-text-dim">
                        Poništi
                    </Button>

                    <Button
                        disabled={!request || step === 'analysis' || step === 'elaboration' || step === 'applying'}
                        onClick={handleNext}
                        className="h-14 px-10 gap-3 rounded-2xl shadow-xl shadow-brand/20 font-bold"
                    >
                        {step === 'input' ? 'Analiziraj Zahtjev' : step === 'confirmation' ? 'Odobravam Implementaciju' : 'Procesiranje...'}
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
