import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
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

const steps = ["Upload", "Osnove", "APA Podaci", "Pregled"];

export default function NewProjectWizard({ open, onOpenChange }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
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

    const launchProject = async (finalData: any) => {
        setIsCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Korisnik nije prijavljen");

            // 1. Create Project
            const projectInsert = {
                title: finalData.title || "Novi Projekat",
                donor_name: finalData.donor_name || null,
                owner_id: user.id,
                project_language: finalData.project_language || 'bs',
                status: 'in_progress',
                apa_collected_data: finalData
            };

            const { data: project, error: pError } = await supabase
                .from('projects')
                .insert(projectInsert as any)
                .select()
                .single();

            if (pError || !project) {
                console.error("Supabase Project Error:", pError);
                throw pError || new Error("Neuspješno kreiranje projekta");
            }

            const projectData = project as any;

            // 2. Initialize default sections
            const defaultSections = [
                { key: 'uvod', title: 'Uvod i pozadina' },
                { key: 'problem', title: 'Opis problema' },
                { key: 'ciljevi', title: 'Ciljevi i rezultati' },
                { key: 'aktivnosti', title: 'Metodologija i aktivnosti' },
                { key: 'budzet', title: 'Budžet i resursi' }
            ];

            const sectionsToInsert = defaultSections.map((s, i) => ({
                project_id: projectData.id,
                section_key: s.key,
                section_title_bs: s.title,
                display_order: i,
                status: 'pending'
            }));

            const { error: sError } = await supabase.from('project_sections').insert(sectionsToInsert as any);
            if (sError) console.warn("Sections init warning:", sError);

            toast.success("Projekat uspješno inicijaliziran!");
            onOpenChange(false);
            navigate(`/projects/${projectData.id}/edit`);

        } catch (err: any) {
            console.error("Launch error details:", err);
            toast.error("Greška: " + (err.message || "Neuspješno kreiranje projekta"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-bg-secondary border-white/5 border shadow-2xl">
                <div className="sr-only">
                    <DialogTitle>Novi Projektni Prijedlog</DialogTitle>
                    <DialogDescription>Čarobnjak za kreiranje novog projekta uz pomoć APA+RIP sistema.</DialogDescription>
                </div>
                <div className="flex flex-col md:flex-row h-[700px] md:h-[600px]">
                    {/* Left: Progress (Hidden on mobile) */}
                    <div className="hidden md:flex w-64 bg-bg-surface p-8 border-r border-white/5 flex-col justify-between">
                        <div>
                            <h2 className="font-display text-xl font-bold text-text-primary mb-12">Novi Projekat</h2>
                            <div className="space-y-8 relative">
                                {/* Connector Line */}
                                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/5" />

                                {steps.map((step, i) => {
                                    const stepNum = i + 1;
                                    const isActive = currentStep === stepNum;
                                    const isCompleted = currentStep > stepNum;

                                    return (
                                        <div key={step} className="flex items-center gap-4 relative z-10">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${isActive ? "bg-primary text-white scale-110 shadow-[0_0_20px_rgba(14,165,233,0.5)]" :
                                                isCompleted ? "bg-emerald-500 text-white" : "bg-bg-tertiary text-text-muted border border-white/5"
                                                }`}>
                                                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? "text-primary" : "text-text-dim"}`}>
                                                    Korak {stepNum}
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

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Status Sistema</p>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] text-emerald-500/80">APA RIP Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 flex flex-col relative">
                        {isCreating && (
                            <div className="absolute inset-0 bg-bg-secondary/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8">
                                <div className="relative h-20 w-20 mb-6">
                                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Inicijalizacija Projekta...</h3>
                                <p className="text-sm text-text-dim max-w-xs">
                                    APA sistem kreira bazu podataka, mapira RIP kontekst i priprema vaš editor.
                                </p>
                            </div>
                        )}

                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    {currentStep === 1 && <Step1Upload onNext={handleNext} />}
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
