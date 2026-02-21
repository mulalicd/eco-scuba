import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Props {
    onNext: (data: any) => void;
}

export default function Step1Upload({ onNext }: Props) {
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

    const handleProcess = () => {
        if (!file) return;
        setAnalyzing(true);

        // Simulate analysis
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    onNext({
                        hasTemplate: true,
                        fileName: file.name,
                        extractedData: { donor_name: "Ambasada Švedske", priority_area: "Zaštita okoliša" }
                    });
                }, 500);
            }
        }, 200);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">Umitajte aplikacijsku formu</h3>
                <p className="text-text-dim text-sm">
                    Otpremite PDF formu (obrazac) donatora. Naš AI (APA) će analizirati sekcije i prilagoditi alat vašoj formi.
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
                            {isDragActive ? "Pustite fajl ovdje..." : "Prevucite PDF ili kliknite za odabir"}
                        </p>
                        <p className="text-text-muted text-xs">Maksimalna veličina: 10MB</p>
                    </div>

                    {file && (
                        <div className="mt-6 w-full max-w-lg bg-bg-surface p-4 rounded-xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-dim">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="text-text-dim hover:text-danger">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    <div className="mt-8 flex gap-4">
                        <Button variant="ghost" className="text-text-muted" onClick={() => onNext({ hasTemplate: false })}>
                            Preskoči (koristi standardni format)
                        </Button>
                        <Button disabled={!file} onClick={handleProcess}>
                            Analiziraj formu
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative h-24 w-24 mb-6">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h4 className="text-lg font-semibold text-text-primary mb-2">APA analizira dokument...</h4>
                    <p className="text-text-dim text-sm mb-8">Ekstrakcija sekcija, boja i prepoznavanje tabela.</p>
                    <div className="w-full max-w-md space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-text-dim font-bold">
                            <span>Skeniranje</span>
                            <span>{progress}%</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-auto pt-6 flex items-center gap-2 text-warning/80 bg-warning/5 p-4 rounded-lg">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs leading-relaxed">
                    <strong>Napomena:</strong> APA sistem najbolje prepoznaje PDF dokumente sa jasno definisanim sekcijama i tabelama.
                </p>
            </div>
        </div>
    );
}
