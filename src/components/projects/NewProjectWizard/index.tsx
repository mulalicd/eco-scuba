// src/components/projects/NewProjectWizard/index.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import Step0PublicCall from "./Step0PublicCall";
import Step1Upload from "./Step1Upload";
import Step2Basics from "./Step2Basics";
import Step3APAData from "./Step3APAData";
import Step4Review from "./Step4Review";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps = ["Javni Poziv", "Obrazac", "Osnove", "APA Podaci", "Pregled"];

export default function NewProjectWizard({ open, onOpenChange }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({
        project_language: 'bs',
        status: 'draft'
    });
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const handleNext = async (data: any) => {
        const updatedData = { ...formData, ...data };
        setFormData(updatedData);

        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            await launchProject(updatedData);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const launchProject = async (finalData: any) => {
        setIsCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Korisnik nije prijavljen");

            // 1. Create Project
            const projectInsert: any = {
                title: finalData.title || "Novi Projekat",
                donor_name: finalData.donor_name || null,
                owner_id: user.id,
                status: 'in_progress',
                form_template_analysis: finalData.extractedData || {},
                apa_collected_data: finalData,
                priority_area: finalData.priority_area || null,
                project_language: finalData.project_language || 'bs',
            };


            const { data: project, error: pError } = await supabase
                .from('projects')
                .insert(projectInsert)
                .select()
                .single();

            if (pError || !project) {
                console.error("Supabase Project Create Error:", {
                    message: pError?.message,
                    details: pError?.details,
                    hint: pError?.hint,
                    payload: projectInsert
                });
                throw pError || new Error("Neuspješno kreiranje projekta");
            }

            const projectData = project as any;

            // 2. Initialize sections
            const mandatorySections = [
                { key: 'naslovna_strana', title: 'Naslovna strana', order: 0 },
                { key: 'uvod', title: 'Uvod', order: 1 },
                { key: 'sazetak', title: 'Sažetak', order: 2 },
                { key: 'nositelj', title: 'Informacije o nositelju projekta', order: 3 },
                { key: 'potreba_problem', title: 'Potreba/problem u lokalnoj zajednici', order: 4 },
                { key: 'razlozi_znacaj', title: 'Razlozi i značaj projekta', order: 5 },
                { key: 'ciljevi', title: 'Ciljevi projekta', order: 6 },
                { key: 'ciljna_grupa', title: 'Ciljna grupa', order: 7 },
                { key: 'sveukupni_cilj', title: 'Sveukupni cilj projekta', order: 8 },
                { key: 'specificni_ciljevi', title: 'Specifični ciljevi projekta', order: 9 },
                { key: 'ocekivani_rezultati', title: 'Očekivani rezultati', order: 10 },
                { key: 'aktivnosti', title: 'Aktivnosti', order: 11 },
                { key: 'pretpostavke_rizici', title: 'Pretpostavke i rizici', order: 12 },
                { key: 'trajanje_projekta', title: 'Trajanje projekta', order: 13 },
                { key: 'pracenje', title: 'Praćenje provedbe i izvještavanje', order: 14 },
                { key: 'budzet', title: 'Budžet', order: 15 },
                { key: 'vidljivost', title: 'Vidljivost (Promocija projekta)', order: 16 },
                { key: 'lista_aneksa', title: 'Lista aneksa', order: 17 }
            ];

            const sectionsToInsert = mandatorySections.map((s) => ({
                project_id: projectData.id,
                section_key: s.key,
                section_title_bs: s.title,
                display_order: s.order,
                status: 'pending'
            }));

            const { error: sError } = await supabase.from('project_sections').insert(sectionsToInsert as any);
            if (sError) console.warn("Sections init warning:", sError);

            toast.success("Projekat uspješno inicijaliziran prema v3.1 protokolu!");
            onOpenChange(false);
            navigate(`/projects/${projectData.id}/edit`);

        } catch (err: any) {
            toast.error("Greška: " + (err.message || "Neuspješno kreiranje projekta"));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-bg-secondary border-white/5 border shadow-2xl">
                <div className="sr-only">
                    <DialogTitle>Novi Projektni Prijedlog</DialogTitle>
                    <DialogDescription>Čarobnjak v3.1 — Od Javnog poziva do finalnog prijedloga.</DialogDescription>
                </div>
                <div className="flex flex-col md:flex-row h-[700px] md:h-[650px]">
                    {/* Left Progress */}
                    <div className="hidden md:flex w-72 bg-bg-surface p-8 border-r border-white/5 flex-col justify-between">
                        <div>
                            <h2 className="font-display text-xl font-bold text-text-primary mb-10 tracking-tight">Novi Projekat</h2>
                            <div className="space-y-6 relative">
                                <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-white/5" />
                                {steps.map((step, i) => {
                                    const isActive = currentStep === i;
                                    const isCompleted = currentStep > i;
                                    return (
                                        <div key={step} className="flex items-center gap-4 relative z-10 transition-all duration-300">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${isActive ? "bg-primary text-white scale-110 shadow-[0_0_20px_rgba(14,165,233,0.4)]" :
                                                isCompleted ? "bg-emerald-500 text-white" : "bg-bg-tertiary text-text-muted border border-white/5"
                                                }`}>
                                                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-primary" : "text-text-dim"}`}>
                                                    Korak {i + 1}
                                                </span>
                                                <span className={`text-sm font-medium ${isActive ? "text-text-primary" : "text-text-muted"}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">APA Engine Status</p>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse outline outline-emerald-500/30 outline-offset-2" />
                                <span className="text-[11px] text-emerald-500/80 font-medium">Sistem v3.1 Aktivan</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 flex flex-col relative bg-bg-secondary/50">
                        {isCreating && (
                            <div className="absolute inset-0 bg-bg-secondary/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-8 animate-in fade-in transition-all">
                                <div className="relative h-16 w-16 mb-6">
                                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                                    <div className="absolute inset-0 border-2 border-primary rounded-full animate-spin border-t-transparent" />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Konfiguracija Projekta v3.1</h3>
                                <p className="text-sm text-text-dim max-w-xs leading-relaxed">
                                    Inicijalizacija RIP Faze 0, mapiranje scoring kriterija i kreiranje strukture sekcija...
                                </p>
                            </div>
                        )}
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    {currentStep === 0 && <Step0PublicCall onNext={handleNext} />}
                                    {currentStep === 1 && <Step1Upload onNext={handleNext} onBack={handleBack} />}
                                    {currentStep === 2 && <Step2Basics data={formData} onNext={handleNext} onBack={handleBack} />}
                                    {currentStep === 3 && <Step3APAData data={formData} onNext={handleNext} onBack={handleBack} />}
                                    {currentStep === 4 && <Step4Review data={formData} onNext={handleNext} onBack={handleBack} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
