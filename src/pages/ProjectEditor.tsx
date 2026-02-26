import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileDown,
    Mail,
    MoreHorizontal,
    Play,
    Save,
    Loader2,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useProjectStore } from "@/store/projectStore";
import { supabase } from "@/lib/supabase";
import { Project, ProjectSection, ChangeLogEntry, Profile } from "@/types";
import { SectionNavigator } from "@/components/editor/SectionNavigator";
import SectionCard from "@/components/editor/SectionCard";
import RIPPhase from "@/components/editor/RIPPhase";
import { APAStatePanel } from "@/components/editor/APAStatePanel";
import { generateProposalPDF } from "@/lib/pdf-generator";
import { useAIStream } from "@/hooks/useAIStream";
import { toast } from "sonner";
import ChangeRequestPanel from "@/components/editor/ChangeRequestPanel";
import FinalAssemblyModal from "@/components/editor/FinalAssemblyModal";

interface ProjectCollaborator {
    id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'reviewer' | 'viewer';
    status: 'pending' | 'accepted' | 'declined';
    profiles?: Profile;
}

export default function ProjectEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useUIStore();
    const {
        currentProject,
        sections,
        setCurrentProject,
        setSections,
        updateSection
    } = useProjectStore();

    const { content: streamingContent, isStreaming, streamSection } = useAIStream();
    const [loading, setLoading] = useState(true);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
    const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
    const [changeSection, setChangeSection] = useState<ProjectSection | null>(null);
    const [showAssembly, setShowAssembly] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            fetchProjectData();
            subscribeToChanges();
        }
    }, [id]);

    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const { data: project, error: pError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (pError) throw pError;
            setCurrentProject(project as any);
            setPageTitle(project?.title || "Projekat");

            const { data: sectionsData, error: sError } = await supabase
                .from('project_sections')
                .select('*')
                .eq('project_id', id)
                .order('display_order', { ascending: true });

            if (sError) throw sError;
            setSections((sectionsData || []) as any);

            const { data: collabData } = await supabase
                .from('project_collaborators')
                .select('*, profiles(*)')
                .eq('project_id', id);

            setCollaborators((collabData as any) || []);

            const { data: logData } = await supabase
                .from('change_log')
                .select('*')
                .eq('project_id', id)
                .order('created_at', { ascending: false });

            setChangeLog((logData as any) || []);

        } catch (err) {
            console.error("Error fetching project data:", err);
            toast.error("Greška pri učitavanju projekta.");
        } finally {
            setLoading(false);
        }
    };

    const subscribeToChanges = () => {
        const channel = supabase
            .channel(`project-${id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'project_sections',
                filter: `project_id=eq.${id}`
            }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    updateSection(payload.new.section_key, payload.new as any);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const scrollToSection = (sectionId: string) => {
        setActiveSectionId(sectionId);
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleApprove = useCallback(async (sectionId: string) => {
        try {
            const { error } = await supabase
                .from('project_sections')
                .update({ status: 'approved', approved_at: new Date().toISOString() } as any)
                .eq('id', sectionId);

            if (error) throw error;
            toast.success("Sekcija odobrena!");
        } catch (err) {
            toast.error("Greška pri odobravanju.");
        }
    }, [id]);

    const handleRegenerate = useCallback(async (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section || !currentProject) return;

        try {
            // Set status to generating locally & in DB
            updateSection(section.section_key, { ...section, status: 'generating' });
            await supabase
                .from('project_sections')
                .update({ status: 'generating' } as any)
                .eq('id', sectionId);

            // Start stream
            const finalContent = await streamSection({
                project_id: currentProject.id,
                section_key: section.section_key,
                protocol: 'WA',
                messages: [], // We can pull existing context if needed
                project_context: {
                    title: currentProject.title,
                    donor: currentProject.donor_name,
                    priority: currentProject.priority_area,
                    goals: currentProject.apa_collected_data
                }
            });

            if (finalContent) {
                // Save final content
                const { error: updError } = await supabase
                    .from('project_sections')
                    .update({
                        content_html: finalContent,
                        status: 'awaiting_approval',
                        version: (section.version || 1) + 1
                    } as any)
                    .eq('id', sectionId);

                if (updError) throw updError;
                toast.success(`Sekcija "${section.section_title_bs}" generisana.`);
            }

        } catch (err) {
            console.error("Stream error:", err);
            toast.error("Greška pri generisanju sekcije.");
            await supabase
                .from('project_sections')
                .update({ status: 'pending' } as any)
                .eq('id', sectionId);
        }
    }, [sections, currentProject, streamSection, updateSection]);

    const handleExportPDF = async () => {
        if (!currentProject) return;

        const approvedSections = sections.filter(s => s.status === 'approved');
        if (approvedSections.length === 0) {
            toast.warning("Nijedna sekcija nije odobrena za izvoz.");
            return;
        }

        setShowAssembly(true);
    };

    const finalizeExport = async () => {
        setShowAssembly(false);
        const approvedSections = sections.filter(s => s.status === 'approved');

        if (!currentProject) return;

        toast.promise(generateProposalPDF(approvedSections as any, currentProject.title, currentProject.donor_name ?? undefined), {
            loading: 'Generišem industrijski PDF...',
            success: 'Projektni prijedlog uspješno sačuvan!',
            error: 'Greška pri generisanju PDF-a.'
        });
    };

    const handleChangeRequest = useCallback((section: any) => {
        setChangeSection(section);
    }, []);

    const handleApplyChange = useCallback(async (description: string) => {
        if (!changeSection || !currentProject) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Korisnik nije prijavljen");

            // Apply FIX-06 protocol: APA Analysis already shown in UI
            // Now log the change request in DB
            await (supabase.from('change_log') as any).insert({
                project_id: currentProject.id,
                requested_by: user.id,
                change_description: description,
                affected_sections: [changeSection.section_title_bs],
                status: 'pending'
            });

            const sId = changeSection.id;
            setChangeSection(null);
            handleRegenerate(sId);
            toast.success("Izmjena registrovana i sekcija se ponovo piše.");
        } catch (err) {
            console.error("Change apply error:", err);
            toast.error("Greška pri bilježenju izmjene.");
        }
    }, [changeSection, currentProject, handleRegenerate]);

    const approvedCount = useMemo(() =>
        sections.filter(s => s.status === 'approved').length,
        [sections]);

    const renderedSections = useMemo(() =>
        sections.map((section) => (
            <SectionCard
                key={section.id}
                section={section as any}
                onApprove={handleApprove}
                onRegenerate={handleRegenerate}
                onEdit={() => handleChangeRequest(section)}
            />
        )),
        [sections, handleApprove, handleRegenerate, handleChangeRequest]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
                <Loader2 className="h-10 w-10 text-brand animate-spin" />
                <p className="text-text-dim text-sm font-medium animate-pulse">Učitavam APA State Register...</p>
            </div>
        );
    }


    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-6 bg-bg-primary">
            {/* Left Column: Section Navigator */}
            <SectionNavigator
                sections={sections as any}
                activeSectionId={activeSectionId}
                onSectionClick={scrollToSection}
                approvedCount={approvedCount}
                totalCount={sections.length}
            />

            {/* Center Column: canvas */}
            <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden border-r border-border relative">
                {/* Editor Top Bar */}
                <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-bg-secondary/40 backdrop-blur-xl z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} className="text-text-dim">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display font-bold text-base truncate max-w-[240px] leading-tight">
                                {currentProject?.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] text-text-dim font-bold uppercase tracking-widest whitespace-nowrap">
                                    {currentProject?.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border bg-bg-tertiary/30 text-xs font-bold" onClick={handleExportPDF}>
                            <FileDown className="h-4 w-4 text-brand" /> Izvezi PDF
                        </Button>
                        <Button variant="brand" size="sm" className="h-9 gap-2 text-xs font-bold px-4 shadow-lg shadow-brand/20">
                            <Mail className="h-4 w-4" /> Pošalji
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-text-dim">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Canvas */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar space-y-12 pb-40"
                >
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* RIP Phase Banner */}
                        <RIPPhase />

                        {/* Sections */}
                        {renderedSections}
                    </div>
                </div>

                {/* Change Request Panel [FIX-06] */}
                {changeSection && (
                    <ChangeRequestPanel
                        sectionTitle={changeSection.section_title_bs}
                        onApply={handleApplyChange}
                        onCancel={() => setChangeSection(null)}
                    />
                )}

                {/* Final Assembly Modal [FIX-08] */}
                {showAssembly && (
                    <FinalAssemblyModal
                        sections={sections}
                        onComplete={finalizeExport}
                        onCancel={() => setShowAssembly(false)}
                    />
                )}

                {/* Glass Overlay for Streaming */}
                <AnimatePresence>
                    {isStreaming && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 
                         bg-bg-secondary/80 backdrop-blur-xl border border-brand/30 
                         px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl"
                        >
                            <Loader2 className="h-5 w-5 text-brand animate-spin" />
                            <p className="text-sm font-medium text-text-primary whitespace-nowrap">
                                APA AI piše sadržaj... <span className="text-text-dim ml-2 italic text-xs">{streamingContent.length} karaktera</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column: APA State Panel */}
            <APAStatePanel
                projectTitle={currentProject?.title || "Projekat"}
                sections={sections}
                collaborators={collaborators}
                ripStatus={(currentProject as any)?.rip_status || 'PENDING'}
                changeLog={changeLog}
            />
        </div>
    );
}
