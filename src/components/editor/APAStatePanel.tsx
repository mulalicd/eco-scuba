import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ClipboardCheck,
    History,
    Users,
    Info,
    Search,
    AlertCircle,
    ShieldCheck
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
        <div className="w-[340px] h-full flex flex-col border-l border-border bg-card sticky top-0 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30 backdrop-blur-3xl">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">APA State Register</p>
                </div>
                <h2 className="text-sm font-bold truncate text-foreground leading-tight">{projectTitle}</h2>
            </div>

            <Tabs defaultValue="register" className="flex-1 flex flex-col">
                <div className="px-4 py-3 border-b border-border bg-card/50">
                    <TabsList className="grid grid-cols-4 h-10 bg-muted border border-border p-1 rounded-xl">
                        <TabsTrigger value="register" title="Register" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ClipboardCheck className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="rip" title="RIP Research" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Search className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="changes" title="Dnevnik izmjena" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><History className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="collabs" title="Saradnici" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="h-4 w-4" /></TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* REGISTER TAB */}
                    <TabsContent value="register" className="m-0 focus-visible:outline-none">
                        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status sekcija</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">AUTORITATIVNO</span>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 px-6 text-muted-foreground">Sekcija</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right pr-6 text-muted-foreground">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sections.map((s) => (
                                    <TableRow key={s.id} className="hover:bg-muted/30 border-border transition-colors">
                                        <TableCell className="py-4 px-6">
                                            <p className="text-[11px] font-bold text-foreground truncate max-w-[160px] tracking-tight">
                                                {s.section_title_bs}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">Verzija {s.version}</p>
                                        </TableCell>
                                        <TableCell className="text-right py-4 pr-6">
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border",
                                                SECTION_STATUS_CONFIG[s.status as keyof typeof SECTION_STATUS_CONFIG]?.bg,
                                                SECTION_STATUS_CONFIG[s.status as keyof typeof SECTION_STATUS_CONFIG]?.color,
                                                "border-current/10"
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
                    <TabsContent value="rip" className="m-0 p-6 focus-visible:outline-none">
                        <div className="relative mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">RIP Status Protokola</h4>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest border",
                                    ripStatus === 'COMPLETE' ? "bg-success/10 text-success border-success/20" :
                                        ripStatus === 'IN_PROGRESS' ? "bg-primary/10 text-primary animate-pulse border-primary/20" : "bg-muted text-muted-foreground border-border"
                                )}>
                                    {ripStatus}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Istraživačke Domene</p>
                                    <div className="space-y-3">
                                        {[
                                            'Legislativni i strateški okvir',
                                            'Geografski i ekološki kontekst',
                                            'Demografski i socioekonomski profil',
                                            'Institucionalna mapa i saradnja',
                                            'Analiza sličnih projekata',
                                            'Sektor vodenih sportova i edukacije'
                                        ].map(d => (
                                            <div key={d} className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
                                                <span className="text-[11px] text-muted-foreground font-medium tracking-tight leading-none">{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20">
                                    <div className="flex items-center gap-2 mb-3 text-warning">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">[PODATAK NEDOSTAJE]</span>
                                    </div>
                                    <ul className="text-[10px] text-muted-foreground list-none space-y-2 font-medium">
                                        <li className="flex gap-2"><span>•</span> <span>Specifični podaci o budžetu općina za eko-akcije.</span></li>
                                        <li className="flex gap-2"><span>•</span> <span>Ažurirani registar NGO-a u Neumu.</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CHANGES TAB */}
                    <TabsContent value="changes" className="m-0 p-6 focus-visible:outline-none">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dnevnik Izmjena</h4>
                            <span className="text-[9px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">AUTO-PROPAGACIJA</span>
                        </div>
                        <div className="space-y-8">
                            {changeLog.length > 0 ? changeLog.map((c, i) => (
                                <div key={i} className="relative pl-6 pb-2 border-l border-primary/20 last:pb-0">
                                    <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)] border border-background" />
                                    <p className="text-[11px] font-black text-foreground mr-1 tracking-tight">
                                        {c.affected_sections?.length > 0 ? c.affected_sections.join(', ') : "Globalna izmjena"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed font-medium">
                                        {c.change_description}
                                    </p>
                                    <div className="mt-4 p-2 rounded-lg bg-muted/30 border border-border">
                                        <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-1">Status Propagacije</p>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-1 w-1 rounded-full",
                                                c.status === 'applied' ? "bg-success" : "bg-warning"
                                            )} />
                                            <span className="text-[9px] text-muted-foreground font-bold">
                                                {c.status === 'applied' ? "Uspješno primijenjeno" : "Čeka na primjenu"}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground mt-4 font-bold">{new Date(c.created_at).toLocaleDateString('bs-BA')}</p>
                                </div>
                            )) : (
                                <div className="text-center py-12 opacity-20">
                                    <History className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Nema registrovanih izmjena</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* COLLABS TAB */}
                    <TabsContent value="collabs" className="m-0 p-6 focus-visible:outline-none">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Aktivni Saradnici</h4>
                        <div className="space-y-5">
                            {collaborators.map((c, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-all duration-300 border border-transparent hover:border-border">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[12px] font-black text-primary shadow-lg shadow-primary/10">
                                        {c.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-bold text-foreground truncate tracking-tight">{c.profiles?.full_name || 'Korisnik'}</p>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{c.role}</p>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]" />
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Footer */}
            <div className="p-6 bg-muted/30 backdrop-blur-3xl border-t border-border">
                <div className="flex gap-3">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-relaxed text-muted-foreground uppercase tracking-wider">
                        APA State Memory Engine automatski prati sve promjene i vrši sinhronizaciju kroz cijeli dokument.
                    </p>
                </div>
            </div>
        </div>
    );
}
