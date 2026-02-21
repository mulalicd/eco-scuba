import { AlertTriangle, Check, Edit2, RotateCcw, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    onApprove: () => void;
    onEdit: () => void;
    onRewrite: () => void;
    onAddInfo: () => void;
    isDisabled?: boolean;
}

export function DisclaimerBanner({ onApprove, onEdit, onRewrite, onAddInfo, isDisabled }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-xl border-2 border-amber-400/40 bg-amber-950/25 p-5"
        >
            <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="font-semibold text-amber-300 text-sm mb-2">
                        ⚠️ NAPOMENA O ODGOVORNOSTI KORISNIKA
                    </p>
                    <p className="text-amber-200/75 text-sm leading-relaxed mb-3">
                        APA sistem može sadržavati greške, netačne ili zastarjele podatke,
                        naročito statističke podatke, imena dužnosnika, zakonske reference
                        i podatke specifične za lokalne zajednice u Bosni i Hercegovini.
                    </p>
                    <div className="text-amber-200/75 text-sm mb-5 space-y-0.5">
                        <p className="font-medium text-amber-300">Korisnik je dužan:</p>
                        <p>✔ Pažljivo pregledati svaki dio ove sekcije</p>
                        <p>✔ Verificirati sve statističke podatke i zakonske reference</p>
                        <p>✔ Korigovati sve nepreciznosti prije davanja odobrenja</p>
                        <p>✔ Preuzeti punu odgovornost za tačnost finalnog prijedloga</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={onApprove}
                            disabled={isDisabled}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 
                         hover:bg-emerald-500 text-white text-sm font-medium transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Check className="h-4 w-4" />
                            Odobravam
                        </button>
                        <button
                            onClick={onEdit}
                            disabled={isDisabled}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brand/50 
                         text-brand hover:bg-brand/10 text-sm font-medium transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Edit2 className="h-4 w-4" />
                            Izmijeni
                        </button>
                        <button
                            onClick={onRewrite}
                            disabled={isDisabled}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-text-dim/40 
                         text-text-muted hover:bg-bg-tertiary text-sm font-medium transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Napiši ponovo
                        </button>
                        <button
                            onClick={onAddInfo}
                            disabled={isDisabled}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-text-dim/40 
                         text-text-muted hover:bg-bg-tertiary text-sm font-medium transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                            Dodaj informacije
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
