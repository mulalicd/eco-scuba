import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    data: any;
    onNext: (data: any) => void;
    onBack: () => void;
}

const questions = [
    {
        id: 'target_group',
        label: 'Ko je vaša ciljna grupa?',
        placeholder: 'npr. Mladi nezaposleni ronioci iz Kantona Sarajevo...',
        description: 'APA će prilagoditi ton pisanja i argumentaciju prema ovoj populaciji.',
        type: 'input'
    },
    {
        id: 'main_activities',
        label: 'Navedite glavne aktivnosti projekta',
        placeholder: 'npr. 5 ekoloških akcija čišćenja, 3 edukativna seminara...',
        description: 'Ovaj podatak je ključan za RIP protokol i analizu resursa.',
        type: 'textarea'
    },
    {
        id: 'duration_months',
        label: 'Koliko mjeseci će trajati projekat?',
        placeholder: 'npr. 12',
        description: 'APA će automatski predložiti vremenski okvir po sekcijama.',
        type: 'number'
    },
    {
        id: 'requested_amount',
        label: 'Koliki iznos (KM) tražite od donatora?',
        placeholder: 'npr. 25000',
        description: 'Pomaže APA-i u balansiranju narativa o isplativosti.',
        type: 'number'
    }
];

export default function Step3APAData({ data, onNext, onBack }: Props) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<any>({
        target_group: data.target_group || "",
        main_activities: data.main_activities || "",
        duration_months: data.duration_months || 12,
        requested_amount: data.requested_amount || 0,
    });
    const [isTyping, setIsTyping] = useState(true);

    const currentQ = questions[currentIdx];

    useEffect(() => {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 500);
        return () => clearTimeout(timer);
    }, [currentIdx]);

    const handleNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
        } else {
            onNext(answers);
        }
    };

    const handleBack = () => {
        if (currentIdx > 0) {
            setCurrentIdx(currentIdx - 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> APA Prikupljanje Podataka
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Korak {currentIdx + 1} od {questions.length}
                    </p>
                </div>
                <div className="flex gap-1">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 w-8 rounded-full transition-all duration-300 ${i <= currentIdx ? "bg-primary" : "bg-white/5"}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full space-y-6"
                    >
                        <div className="p-6 bg-bg-tertiary rounded-3xl border border-white/5 shadow-2xl relative group">
                            <div className="absolute -top-3 -left-3 h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <span className="text-white font-bold">{currentIdx + 1}</span>
                            </div>

                            <Label className="text-lg font-bold block mb-2">{currentQ.label}</Label>
                            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{currentQ.description}</p>

                            {currentQ.type === 'textarea' ? (
                                <Textarea
                                    autoFocus
                                    rows={5}
                                    placeholder={currentQ.placeholder}
                                    value={answers[currentQ.id]}
                                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                                    className="bg-bg-surface border-border focus:border-primary transition-all resize-none text-base"
                                />
                            ) : (
                                <Input
                                    autoFocus
                                    type={currentQ.type}
                                    placeholder={currentQ.placeholder}
                                    value={answers[currentQ.id]}
                                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                                    className="bg-bg-surface border-border focus:border-primary transition-all h-14 text-base"
                                />
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-between w-full">
                    <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={handleBack}>
                        <ChevronLeft className="h-4 w-4" /> Nazad
                    </Button>

                    <Button
                        className="h-14 px-10 gap-2 shadow-xl shadow-primary/20 rounded-2xl group"
                        onClick={handleNext}
                        disabled={!answers[currentQ.id] && currentQ.type !== 'number'}
                    >
                        {currentIdx === questions.length - 1 ? "Završi i analiziraj" : "Sljedeće pitanje"}
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            <div className="mt-auto pt-8 flex items-center justify-center gap-3 opacity-30 select-none grayscale">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Enkriptovan prenos ka APA RIP bazi</span>
            </div>
        </div>
    );
}

function Label({ children, className, ...props }: any) {
    return <label className={className} {...props}>{children}</label>;
}
