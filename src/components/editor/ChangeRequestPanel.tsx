import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Check,
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

const ChangeRequestPanel = forwardRef<HTMLDivElement, Props>(({ sectionTitle, onApply, onCancel }, ref) => {
    const [step, setStep] = useState<Step>('input');
    const [request, setRequest] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [elaboration, setElaboration] = useState("");

    const handleNext = () => {
        if (step === 'input') {
            setStep('analysis');
            setTimeout(() => {
                setAnalysis(`Izmjena utiče na terminologiju u sekciji "${sectionTitle}" i potencijalno na budžetske stavke u sekciji "Budžet".`);
                setStep('elaboration');
            }, 1500);

            setTimeout(() => {
                setElaboration(`Planiram korigirati ciljne grupe i osigurati da se novi podaci propagiraju kroz cijeli dokument.`);
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
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
            <div className="w-full max-w-2xl bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <RefreshCw className={`h-6 w-6 text-primary ${step === 'analysis' || step === 'elaboration' || step === 'applying' ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground">APA Protokol Izmjene</h2>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                {sectionTitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {step === 'input' && (
                            <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <p className="text-sm text-primary font-medium leading-relaxed">
                                        Opišite što želite promijeniti u ovoj sekciji. APA će analizirati zahtjev,
                                        elaborirati implikacije i zatražiti vašu finalnu potvrdu prije primjene.
                                    </p>
                                </div>
                                <Textarea
                                    autoFocus
                                    placeholder="npr. Promijeni broj učesnika na 50 i dodaj fokus na ekologiju podmorja..."
                                    className="min-h-[160px] bg-muted/20 border-border focus:border-primary/50 text-base p-6 rounded-2xl text-foreground"
                                    value={request}
                                    onChange={(e) => setRequest(e.target.value)}
                                />
                            </motion.div>
                        )}

                        {(step === 'analysis' || step === 'elaboration' || step === 'confirmation' || step === 'applying') && (
                            <motion.div key="process" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className={`p-6 rounded-2xl border transition-all duration-500 ${step === 'analysis' ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/10' : 'bg-muted/30 border-border opacity-50'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground">1</div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Analiza Zahtjeva</h4>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {analysis || "APA analizira logičke implikacije izmjene..."}
                                    </p>
                                </div>

                                <div className={`p-6 rounded-2xl border transition-all duration-500 ${step === 'elaboration' ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/10' : 'bg-muted/30 border-border opacity-50'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground">2</div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Elaboracija i Planiranje</h4>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {elaboration || "Planiram optimalnu implementaciju vašeg zahtjeva..."}
                                    </p>
                                </div>

                                {step === 'confirmation' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border-2 border-success/30 bg-success/5">
                                        <div className="flex gap-4">
                                            <ShieldAlert className="h-6 w-6 text-success shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-success mb-2">POTVRDA PRIMJENE</p>
                                                <p className="text-sm text-foreground leading-relaxed italic">
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
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                                        <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-[0.2em]">Primjenjujem izmjene i vršim globalnu propagaciju...</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-border bg-muted/20 flex items-center justify-between">
                    <Button variant="ghost" onClick={onCancel} className="gap-2 text-muted-foreground">
                        Poništi
                    </Button>
                    <Button
                        disabled={!request || step === 'analysis' || step === 'elaboration' || step === 'applying'}
                        onClick={handleNext}
                        className="h-14 px-10 gap-3 rounded-2xl shadow-xl shadow-primary/20 font-bold"
                    >
                        {step === 'input' ? 'Analiziraj Zahtjev' : step === 'confirmation' ? 'Odobravam Implementaciju' : 'Procesiranje...'}
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
});

ChangeRequestPanel.displayName = 'ChangeRequestPanel';

export default ChangeRequestPanel;
