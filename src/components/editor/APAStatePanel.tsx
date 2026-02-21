import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ClipboardCheck,
    History,
    Users,
    Info,
    Search,
    AlertCircle
} from "lucide-react";
import { SECTION_STATUS_CONFIG } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
    projectTitle: string;
    sections: any[];
    collaborators: any[];
    ripStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE';
    changeLog: any[];
}

export function APAStatePanel({ projectTitle, sections, collaborators, ripStatus, changeLog }: Props) {
    return (
        <div className="w-[320px] h-full flex flex-col border-l border-border bg-bg-secondary sticky top-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-bg-tertiary/30">
                <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">APA State Register</p>
                <h2 className="text-sm font-bold truncate text-text-primary">{projectTitle}</h2>
            </div>

            <Tabs defaultValue="register" className="flex-1 flex flex-col">
                <div className="px-4 py-2 border-b border-border bg-bg-secondary">
                    <TabsList className="grid grid-cols-4 h-9 bg-bg-tertiary">
                        <TabsTrigger value="register" title="Register"><ClipboardCheck className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="rip" title="RIP Research"><Search className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="changes" title="Dnevnik izmjena"><History className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="collabs" title="Saradnici"><Users className="h-4 w-4" /></TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* REGISTER TAB */}
                    <TabsContent value="register" className="m-0 focus-visible:outline-none">
                        <div className="p-3 border-b border-border bg-bg-tertiary/20 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase text-text-dim">Status sekcija</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand/10 text-brand">V2.0</span>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="text-[10px] h-9 px-4">Sekcija</TableHead>
                                    <TableHead className="text-[10px] h-9 text-right pr-4">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sections.map((s) => (
                                    <TableRow key={s.id} className="hover:bg-white/5 border-border">
                                        <TableCell className="py-2.5 px-4">
                                            <p className="text-[11px] font-medium text-text-primary truncate max-w-[160px]">
                                                {s.section_title_bs}
                                            </p>
                                            <p className="text-[9px] text-text-dim">Verzija {s.version}</p>
                                        </TableCell>
                                        <TableCell className="text-right py-2.5 pr-4">
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter",
                                                SECTION_STATUS_CONFIG[s.status as keyof typeof SECTION_STATUS_CONFIG]?.bg,
                                                SECTION_STATUS_CONFIG[s.status as keyof typeof SECTION_STATUS_CONFIG]?.color
                                            )}>
                                                {SECTION_STATUS_CONFIG[s.status as keyof typeof SECTION_STATUS_CONFIG]?.label}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    {/* RIP TAB */}
                    <TabsContent value="rip" className="m-0 p-4 focus-visible:outline-none">
                        <div className="relative mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-bold uppercase text-text-dim">RIP Status</h4>
                                <div className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold",
                                    ripStatus === 'COMPLETE' ? "bg-success/10 text-success" :
                                        ripStatus === 'IN_PROGRESS' ? "bg-brand/10 text-brand animate-pulse" : "bg-bg-tertiary text-text-dim"
                                )}>
                                    {ripStatus}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-bg-tertiary/40 border border-border">
                                    <p className="text-[10px] font-bold uppercase text-text-dim mb-2">Pokriveni domeni</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {['Zakonski', 'Ekološki', 'Demografski', 'Institucionalni', 'Istorijski', 'Sektorski'].map(d => (
                                            <div key={d} className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                                                <span className="text-[10px] text-text-muted">{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
                                    <div className="flex items-center gap-2 mb-2 text-warning">
                                        <AlertCircle className="h-3 w-3" />
                                        <span className="text-[10px] font-bold uppercase">Nedostajući podaci</span>
                                    </div>
                                    <ul className="text-[10px] text-amber-200/60 list-disc list-inside space-y-1">
                                        <li>Tacni brojevi budžeta općina</li>
                                        <li>Najnoviji podaci o zagađenju za 2024.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CHANGES TAB */}
                    <TabsContent value="changes" className="m-0 p-4 focus-visible:outline-none">
                        <h4 className="text-[10px] font-bold uppercase text-text-dim mb-4">Change Log</h4>
                        <div className="space-y-4">
                            {changeLog.length > 0 ? changeLog.map((c, i) => (
                                <div key={i} className="relative pl-5 pb-5 border-l border-brand/30 last:pb-0">
                                    <div className="absolute left-[-4.5px] top-0 h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                                    <p className="text-[11px] font-bold text-text-primary mr-1">{c.section}</p>
                                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                                        {c.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[9px] text-brand/80 font-medium">APA Analiza:</span>
                                        <span className="text-[9px] text-text-dim px-1.5 py-0.5 rounded bg-bg-tertiary">Propagirano</span>
                                    </div>
                                    <p className="text-[9px] text-text-dim mt-2">{c.timestamp}</p>
                                </div>
                            )) : (
                                <div className="text-center py-8 opacity-40">
                                    <History className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-xs">Nema registrovanih izmjena.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* COLLABS TAB */}
                    <TabsContent value="collabs" className="m-0 p-4 focus-visible:outline-none">
                        <h4 className="text-[10px] font-bold uppercase text-text-dim mb-4">Aktivni saradnici</h4>
                        <div className="space-y-4">
                            {collaborators.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary/30 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand">
                                        {c.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-text-primary truncate">{c.profiles?.full_name || 'Korisnik'}</p>
                                        <p className="text-[10px] text-text-dim capitalize">{c.role}</p>
                                    </div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Footer Info */}
            <div className="p-4 bg-bg-tertiary/20 border-t border-border">
                <div className="flex items-center gap-2 text-text-muted">
                    <Info className="h-3 w-3 text-brand" />
                    <p className="text-[10px] font-medium leading-tight">
                        APA State Register automatski prati sve promjene i vrši propagaciju kroz dokument.
                    </p>
                </div>
            </div>
        </div>
    );
}
