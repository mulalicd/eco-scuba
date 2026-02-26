// src/components/projects/NewProjectWizard/Step1Upload.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

interface Props {
    onNext: (data: any) => void;
    onBack: () => void;
}

export default function Step1Upload({ onNext, onBack }: Props) {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    });

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

    const handleProcess = async () => {
        if (!file) return;

        try {
            // Early Session Guard
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Sesija istekla ili korisnik nije prijavljen.");
                navigate("/login");
                return;
            }

            setAnalyzing(true);
            setProgress(10);

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

            setProgress(40);
            setProgress(60);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekundi limit

            const { data, error: funcError } = await supabase.functions.invoke('process-form-upload', {
                body: { 
                    pdf_base64: base64, 
                    text_content: extractedText,
                    source: 'application_form' 
                },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (funcError) {
                console.error("Edge Function Error:", funcError);
                setAnalyzing(false);
                setProgress(0);

                if (funcError.status === 401) {
                    toast.error("Sesija nije prepoznata. Molimo osvježite stranicu i prijavite se ponovo.");
                } else {
                    toast.error("Analiza obrasca nije uspjela. Možete nastaviti bez obrasca.");
                }
                return;
            }

            toast.success("Obrazac uspješno analiziran!");
            setProgress(100);

            setTimeout(() => {
                onNext({
                    hasTemplate: true,
                    fileName: file.name,
                    extractedData: data
                });
            }, 500);

        } catch (err: any) {
            toast.error(err.message || "Neuspješna analiza dokumenta.");
            setAnalyzing(false);
            setProgress(0);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">KORAK 2: Upload obrasca za prijavu</h3>
                <p className="text-text-dim text-sm">
                    Uploadujte zvanični donatorski obrazac (PDF). Sistem će izvršiti "pixel-perfect" analizu formata.
                </p>
            </div>

            {!analyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div
                        {...getRootProps()}
                        className={`w-full max-w-lg p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/10 hover:border-white/20"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-text-primary font-medium mb-1">
                            {isDragActive ? "Pustite fajl ovdje..." : "Prevucite PDF obrazac ili kliknite"}
                        </p>
                        <p className="text-text-muted text-xs">Maksimalna veličina: 10MB</p>
                    </div>

                    {file && (
                        <div className="mt-6 w-full max-w-lg bg-bg-surface p-4 rounded-xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-text-dim">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="text-text-dim hover:text-danger p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    <div className="mt-8 flex gap-3 w-full max-w-lg justify-center">
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10" onClick={onBack}>
                            Nazad
                        </Button>
                        <Button variant="ghost" className="h-12 px-6 rounded-xl text-text-muted" onClick={() => onNext({ hasTemplate: false })}>
                            Bez obrasca (Standard)
                        </Button>
                        <Button disabled={!file} className="h-12 px-8 rounded-xl bg-primary" onClick={handleProcess}>
                            Analiziraj obrazac
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative h-24 w-24 mb-6">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-primary text-xs">
                            {progress}%
                        </div>
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">Analiza strukture obrasca...</h4>
                    <p className="text-text-dim text-sm mb-8 text-center max-w-xs">Identificiranje polja, tabela i fontova unutar donatorskog dokumenta.</p>
                    <div className="w-full max-w-md space-y-2">
                        <Progress value={progress} className="h-1.5 bg-white/5" />
                    </div>
                </div>
            )}

            <div className="mt-auto pt-6 flex items-center gap-2 text-warning/80 bg-warning/5 p-4 rounded-xl border border-warning/10">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-[11px] leading-relaxed">
                    <strong>PIXEL-PERFECT:</strong> APA mapira format obrasca kako bi finalni HTML bio identičan originalu.
                </p>
            </div>
        </div>
    );
}
