import { useMemo } from "react";
import { Check, Edit3, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { parseRIPStatus } from "@/lib/rip-parser";
import DOMPurify from "dompurify";

interface Props {
    section: {
        id: string;
        section_title_bs: string;
        content_html: string;
        status: 'pending' | 'generating' | 'awaiting_approval' | 'approved' | 'revision_requested';
        version: number;
        display_order: number;
    };
    onApprove: (id: string) => void;
    onEdit: (id: string) => void;
    onRegenerate: (id: string) => void;
}

export default function SectionCard({ section, onApprove, onEdit, onRegenerate }: Props) {
    const renderedContent = useMemo(() => {
        const parsed = parseRIPStatus(section.content_html || "");
        return DOMPurify.sanitize(parsed, { USE_PROFILES: { html: true } });
    }, [section.content_html]);

    const isGenerating = section.status === 'generating';
    const isAwaiting = section.status === 'awaiting_approval';
    const isApproved = section.status === 'approved';
    const isRevision = section.status === 'revision_requested';

    return (
        <div id={`section-${section.id}`} className="p-8 bg-card rounded-2xl border border-border shadow-xl space-y-6 relative overflow-hidden group">
            {isGenerating && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
            )}

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-sm text-primary">
                        {section.display_order + 1}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{section.section_title_bs}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isApproved && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
                            <Check className="h-3 w-3" /> ODOBRENO
                        </div>
                    )}
                    {isAwaiting && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold border border-warning/20">
                            <Sparkles className="h-3 w-3" /> ČEKA ODOBRENJE
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="prose max-w-none relative z-10">
                {isGenerating ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse" />
                        <div className="h-4 bg-muted rounded-full w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded-full w-5/6 animate-pulse" />
                        <div className="flex items-center gap-2 text-primary text-sm font-medium animate-pulse mt-4">
                            <Loader2 className="h-4 w-4 animate-spin" /> Generišem sadržaj pomoću APA sistema...
                        </div>
                    </div>
                ) : section.content_html ? (
                    <div
                        className="text-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                        <Sparkles className="h-12 w-12 mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Nema generisanog sadržaja.</p>
                        <Button variant="outline" className="mt-4" onClick={() => onRegenerate(section.id)}>
                            Generiši sekciju
                        </Button>
                    </div>
                )}
            </div>

            {(isAwaiting || isRevision) && (
                <DisclaimerBanner
                    onApprove={() => onApprove(section.id)}
                    onEdit={() => onEdit(section.id)}
                    onRewrite={() => onRegenerate(section.id)}
                    onAddInfo={() => onEdit(section.id)}
                    isDisabled={isGenerating}
                />
            )}

            {isApproved && (
                <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => onEdit(section.id)}>
                        <Edit3 className="h-3.5 w-3.5" /> Izmijeni
                    </Button>
                </div>
            )}
        </div>
    );
}
