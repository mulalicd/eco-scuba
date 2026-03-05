import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileDown,
    FileText,
    Mail,
    MoreHorizontal,
    Loader2,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/store/uiStore";
import { useProjectStore } from "@/store/projectStore";
import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectSection, ChangeLogEntry, Profile } from "@/types";
import { SectionNavigator } from "@/components/editor/SectionNavigator";
import SectionCard from "@/components/editor/SectionCard";
import RIPPhase from "@/components/editor/RIPPhase";
import { APAStatePanel } from "@/components/editor/APAStatePanel";
import { generateProposalPDF } from "@/lib/pdf-generator";
import { generateProposalDOCX } from "@/lib/docx-generator";
import { useAIStream } from "@/hooks/useAIStream";
import { toast } from "sonner";
import ChangeRequestPanel from "@/components/editor/ChangeRequestPanel";
import FinalAssemblyModal from "@/components/editor/FinalAssemblyModal";
import { normalizeGeneratedHtml } from "@/lib/rip-parser";

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
    const [exportType, setExportType] = useState<'pdf' | 'docx'>('pdf');
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

            // AUTO-FIX: Reset stuck 'generating' sections
            const stuckSections = sectionsData?.filter(s => s.status === 'generating') || [];
            if (stuckSections.length > 0) {
                for (const section of stuckSections) {
                    await supabase
                        .from('project_sections')
                        .update({ status: 'pending' } as any)
                        .eq('id', section.id);
                }
                const resetSections = (sectionsData || []).map((s: any) => s.status === 'generating' ? { ...s, status: 'pending' } : s) as any;
                setSections(resetSections);
                toast.info("Zaglavljene sekcije su resetovane.");
            }

            const { data: collabData, error: collabError } = await supabase
                .from('project_collaborators')
                .select('id, user_id, role, status, profiles:profiles!project_collaborators_user_id_fkey(*)')
                .eq('project_id', id);

            if (collabError) {
                console.warn("Collaborators load warning:", collabError.message);
                setCollaborators([]);
            } else {
                setCollaborators((collabData as any) || []);
            }

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

        return () => { supabase.removeChannel(channel); };
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

    // Build full project context for AI including ALL data
    const buildProjectContext = useCallback(() => {
        if (!currentProject) return {};
        return {
            title: currentProject.title,
            donor_name: currentProject.donor_name,
            priority_area: currentProject.priority_area,
            direct_beneficiaries: currentProject.direct_beneficiaries,
            indirect_beneficiaries: (currentProject as any).indirect_beneficiaries,
            total_budget_km: currentProject.total_budget_km,
            requested_budget_km: currentProject.requested_budget_km,
            own_contribution_km: currentProject.own_contribution_km,
            project_duration_months: (currentProject as any).project_duration_months,
            project_start_date: (currentProject as any).project_start_date,
            project_end_date: (currentProject as any).project_end_date,
            project_locations: currentProject.project_locations,
            project_language: currentProject.project_language,
            apa_collected_data: currentProject.apa_collected_data || {},
            rip_data: currentProject.rip_data || {},
            apa_state: currentProject.apa_state || {},
        };
    }, [currentProject]);

    // Get existing sections with content for cross-referencing
    const getExistingSectionsForContext = useCallback(() => {
        return sections
            .filter(s => s.content_html && s.status !== 'pending')
            .map(s => ({
                section_key: s.section_key,
                section_title_bs: s.section_title_bs,
                content_html: s.content_html,
            }));
    }, [sections]);

    const handleRegenerate = useCallback(async (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section || !currentProject) return;

        try {
            updateSection(section.section_key, { ...section, status: 'generating' });
            await supabase
                .from('project_sections')
                .update({ status: 'generating' } as any)
                .eq('id', sectionId);

            const finalContent = await streamSection({
                project_id: currentProject.id,
                section_key: section.section_key,
                protocol: 'WA',
                messages: [],
                project_context: buildProjectContext(),
                existing_sections: getExistingSectionsForContext(),
            });

            const normalizedContent = normalizeGeneratedHtml(finalContent);

            if (normalizedContent) {
                const { error: updError } = await supabase
                    .from('project_sections')
                    .update({
                        content_html: normalizedContent,
                        status: 'awaiting_approval',
                        version: (section.version || 1) + 1
                    } as any)
                    .eq('id', sectionId);

                if (updError) throw updError;
                toast.success(`Sekcija "${section.section_title_bs}" generisana.`);
            } else {
                throw new Error('AI je vratio prazan sadržaj.');
            }
        } catch (err) {
            console.error("Stream error:", err);
            toast.error("Greška pri generisanju sekcije.");
            await supabase
                .from('project_sections')
                .update({ status: 'pending' } as any)
                .eq('id', sectionId);
        }
    }, [sections, currentProject, streamSection, updateSection, buildProjectContext, getExistingSectionsForContext]);

    const handleExport = async (type: 'pdf' | 'docx') => {
        if (!currentProject) return;

        const approvedSections = sections.filter(s => s.status === 'approved');
        if (approvedSections.length === 0) {
            toast.warning("Nijedna sekcija nije odobrena za izvoz.");
            return;
        }

        setExportType(type);
        setShowAssembly(true);
    };

    const finalizeExport = async () => {
        setShowAssembly(false);
        const approvedSections = sections.filter(s => s.status === 'approved');
        if (!currentProject) return;

        const exportFn = exportType === 'docx'
            ? generateProposalDOCX(approvedSections as any, currentProject.title, currentProject.donor_name ?? undefined)
            : generateProposalPDF(approvedSections as any, currentProject.title, currentProject.donor_name ?? undefined);

        toast.promise(exportFn, {
            loading: `Generišem ${exportType.toUpperCase()}...`,
            success: `Projektni prijedlog uspješno sačuvan kao ${exportType.toUpperCase()}!`,
            error: `Greška pri generisanju ${exportType.toUpperCase()}.`
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

            await (supabase.from('change_log') as any).insert({
                project_id: currentProject.id,
                requested_by: user.id,
                change_description: description,
                affected_sections: [changeSection.section_title_bs],
                status: 'pending'
            });

            const sId = changeSection.id;
            const sKey = changeSection.section_key;
            setChangeSection(null);

            // Regenerate with change request context
            const section = sections.find(s => s.id === sId);
            if (!section) return;

            updateSection(section.section_key, { ...section, status: 'generating' });
            await supabase
                .from('project_sections')
                .update({ status: 'generating' } as any)
                .eq('id', sId);

            const finalContent = await streamSection({
                project_id: currentProject.id,
                section_key: sKey,
                protocol: 'WA',
                messages: [],
                project_context: buildProjectContext(),
                existing_sections: getExistingSectionsForContext(),
                change_request: description,
            });

            const normalizedContent = normalizeGeneratedHtml(finalContent);

            if (normalizedContent) {
                await supabase
                    .from('project_sections')
                    .update({
                        content_html: normalizedContent,
                        status: 'awaiting_approval',
                        version: (section.version || 1) + 1
                    } as any)
                    .eq('id', sId);
                toast.success("Izmjena primijenjena i sekcija ponovo napisana.");
            }
        } catch (err) {
            console.error("Change apply error:", err);
            toast.error("Greška pri bilježenju izmjene.");
        }
    }, [changeSection, currentProject, sections, streamSection, updateSection, buildProjectContext, getExistingSectionsForContext]);

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
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm font-medium animate-pulse">Učitavam APA State Register...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-6 bg-background">
            {/* Left Column: Section Navigator */}
            <SectionNavigator
                sections={sections as any}
                activeSectionId={activeSectionId}
                onSectionClick={scrollToSection}
                approvedCount={approvedCount}
                totalCount={sections.length}
            />

            {/* Center Column */}
            <div className="flex-1 flex flex-col bg-background overflow-hidden border-r border-border relative">
                {/* Editor Top Bar */}
                <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card/40 backdrop-blur-xl z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} className="text-muted-foreground">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display font-bold text-base truncate max-w-[240px] leading-tight text-foreground">
                                {currentProject?.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]" />
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest whitespace-nowrap">
                                    {currentProject?.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 gap-2 border-border text-xs font-bold">
                                    <FileDown className="h-4 w-4 text-primary" /> Izvezi
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                                    <FileDown className="h-4 w-4" /> Izvezi kao PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('docx')} className="gap-2">
                                    <FileText className="h-4 w-4" /> Izvezi kao DOCX
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" className="h-9 gap-2 text-xs font-bold px-4 shadow-lg shadow-primary/20">
                            <Mail className="h-4 w-4" /> Pošalji
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Canvas */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 pb-40"
                >
                    <div className="max-w-4xl mx-auto space-y-12">
                        <RIPPhase />
                        {renderedSections}
                    </div>
                </div>

                {/* Change Request Panel */}
                {changeSection && (
                    <ChangeRequestPanel
                        sectionTitle={changeSection.section_title_bs}
                        onApply={handleApplyChange}
                        onCancel={() => setChangeSection(null)}
                    />
                )}

                {/* Final Assembly Modal */}
                {showAssembly && (
                    <FinalAssemblyModal
                        sections={sections}
                        onComplete={finalizeExport}
                        onCancel={() => setShowAssembly(false)}
                    />
                )}

                {/* Streaming Overlay */}
                <AnimatePresence>
                    {isStreaming && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 
                         bg-card/80 backdrop-blur-xl border border-primary/30 
                         px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl"
                        >
                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            <p className="text-sm font-medium text-foreground whitespace-nowrap">
                                APA piše sadržaj... <span className="text-muted-foreground ml-2 italic text-xs">{streamingContent.length} karaktera</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column */}
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
