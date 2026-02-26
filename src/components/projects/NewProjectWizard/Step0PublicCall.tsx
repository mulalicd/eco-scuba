// src/components/projects/NewProjectWizard/Step0PublicCall.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAIStream } from "@/hooks/useAIStream";
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

interface Props {
    onNext: (data: any) => void;
}

export default function Step0PublicCall({ onNext }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { streamSection, isStreaming } = useAIStream();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            const maxPages = Math.min(pdf.numPages, 20);
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: any) => item.str).join(' ') + '\n';
            }
            console.log(`[PDF.js] Ekstrahovan tekst: ${text.length} znakova, ${pdf.numPages} stranica`);
            return text.substring(0, 8000);
        } catch (err: any) {
            console.warn('[PDF.js] Ekstrakcija nije uspjela:', err.message);
            return '';
        }
    };

    const startAnalysis = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);
        setAnalysis(null);

        try {
            // Early Session Guard
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError("Sesija istekla ili korisnik nije prijavljen.");
                setIsUploading(false);
                return;
            }

            // Čitaj PDF kao base64 I ekstrahuj tekst paralelno
            const [base64, extractedText] = await Promise.all([
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }),
                extractTextFromPDF(file)
            ]);

            console.log('[Step0] base64 spreman, tekst ekstrahovan:', extractedText.length, 'znakova');

            // Pošalji kroz Edge Function (ne direktno u streamSection)
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-form-upload`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    pdf_base64: base64,
                    text_content: extractedText,
                    source: 'public_call'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Edge Function greška ${response.status}: ${errText}`);
            }

            const data = await response.json();

            // Success handling (assuming the edge function returns the structure expected by analysis state)
            setAnalysis({
                verdict: "eligible", // Default, model inside JSON can refine this
                program: data.recommended_program || "Analizirani program",
                analysis: data.raw_html_summary || JSON.stringify(data, null, 2)
            });
        } catch (err: any) {
            console.error("UI Error Catch:", err);
            setError(err.message || "Došlo je do neočekivane greške pri analizi.");
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-text-primary">KORAK 1: Upload Javnog poziva</h3>
                <p className="text-sm text-text-dim mt-1">
                    Uploadujte dokument Javnog poziva (tekstualni ili skenirani PDF).
                    Sistem će procijeniti eligibilnost i zahtjeve.
                </p>
            </div>

            {!analysis && (
                <div className="flex-1 flex flex-col">
                    <label className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                        {file ? (
                            <div className="text-center">
                                <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
                                <p className="font-bold text-text-primary">{file.name}</p>
                                <p className="text-xs text-text-dim mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="h-16 w-16 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
                                    <Upload className="h-8 w-8 text-text-dim" />
                                </div>
                                <p className="font-bold text-text-primary">Odaberi PDF dokument</p>
                                <p className="text-xs text-text-dim mt-2">Ili ga prevuci ovdje (Max 25MB)</p>
                            </div>
                        )}
                    </label>

                    <Button
                        className="mt-6 h-14 rounded-2xl font-bold bg-primary hover:bg-brand shadow-lg shadow-primary/20"
                        disabled={!file || isUploading || isStreaming}
                        onClick={startAnalysis}
                    >
                        {isUploading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uplodujem...</> :
                            isStreaming ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analiziram...</> :
                                "Pokreni Eligibility Analizu"}
                    </Button>
                </div>
            )}

            {analysis && (
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-emerald-500">ELIGIBILITY VERDIKT: Ispunjava uslove</h4>
                            <p className="text-sm text-text-primary/80 mt-1">
                                Na osnovu analize, ECO SCUBA u potpunosti ispunjava kriterije za program: <strong>{analysis.program}</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="glass rounded-2xl border border-border p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Info className="h-20 w-20" />
                        </div>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-text-dim mb-4">Analiza RIP Faze 0</h4>
                        <div className="prose prose-sm prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: analysis.analysis }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 py-4">
                        <Button
                            className="h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-500"
                            onClick={() => onNext({ public_call_analysis: analysis })}
                        >
                            (a) Nastavljamo s programom: {analysis.program}
                        </Button>
                        <Button variant="outline" className="h-14 rounded-2xl font-bold border-white/10 hover:bg-white/5">
                            (b) Želim analizu drugog programa
                        </Button>
                        <Button variant="ghost" className="h-14 rounded-2xl font-bold text-text-dim hover:text-white" onClick={() => window.location.reload()}>
                            (c) Ne nastavljamo s ovim pozivom
                        </Button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm font-medium">
                    <AlertCircle className="h-4 w-4" /> {error}
                </div>
            )}
        </div>
    );
}
