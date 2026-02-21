import { FileText, CheckCircle, Loader2, Clock, AlertTriangle, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Section {
    id: string;
    section_key: string;
    section_title_bs: string;
    status: 'pending' | 'generating' | 'awaiting_approval' | 'approved' | 'revision_requested';
}

interface Props {
    sections: Section[];
    activeSectionId: string | null;
    onSectionClick: (id: string) => void;
    approvedCount: number;
    totalCount: number;
}

export default function ProjectEditorSidebar({
    sections,
    activeSectionId,
    onSectionClick,
    approvedCount,
    totalCount
}: Props) {
    const progress = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

    const getStatusIcon = (status: Section['status']) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case 'generating': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'awaiting_approval': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'revision_requested': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default: return <div className="h-4 w-4 rounded-full border-2 border-slate-700" />;
        }
    };

    return (
        <div className="w-[280px] h-full flex flex-col border-r border-border bg-bg-secondary sticky top-0">
            <div className="p-6 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Sekcije projekta</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">{approvedCount}/{totalCount} odobreno</span>
                        <span className="text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 py-4 space-y-1 custom-scrollbar">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => onSectionClick(section.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${activeSectionId === section.id
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <FileText className={`h-4 w-4 shrink-0 ${activeSectionId === section.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                            <span className="text-sm font-medium truncate">{section.section_title_bs}</span>
                        </div>
                        {getStatusIcon(section.status)}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-border">
                <Button variant="outline" className="w-full gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5">
                    <Plus className="h-4 w-4" /> Dodaj opcionalnu sekciju
                </Button>
            </div>
        </div>
    );
}
