import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Provjeri URL parametre za greške
        const params = new URLSearchParams(location.search);
        const errorMsg = params.get("error_description") || params.get("error");

        const hashParams = new URLSearchParams(location.hash.substring(1));
        const hashError = hashParams.get("error_description") || hashParams.get("error");

        if (errorMsg || hashError) {
            setError(errorMsg || hashError || "Nepoznata greška pri prijavi.");
            return;
        }

        // 2. Provjeri postojanje sesije odmah
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate("/dashboard");
            }
        };

        checkSession();

        // 3. Slušaj promjene stanja (za spori redirect)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                navigate("/dashboard");
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, location]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-primary p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-bg-secondary rounded-[32px] border border-white/10 p-10 text-center shadow-2xl"
                >
                    <div className="h-20 w-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-display font-bold mb-3">Greška pri prijavi</h1>
                    <p className="text-text-muted text-sm mb-8 leading-relaxed">
                        {error === "access_denied"
                            ? "Pristup je odbijen. Verovatno ste otkazali prijavu na Google stranici."
                            : error}
                    </p>
                    <Button
                        onClick={() => navigate("/login")}
                        className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold gap-3"
                    >
                        <ArrowLeft className="h-5 w-5" /> Nazad na prijavu
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary gap-6">
            <div className="relative">
                <div className="absolute inset-0 bg-brand/20 blur-[100px] rounded-full" />
                <Loader2 className="h-12 w-12 text-brand animate-spin relative z-10" />
            </div>
            <p className="text-text-dim text-sm font-medium animate-pulse tracking-widest uppercase">
                Verifikacija sesije...
            </p>
        </div>
    );
}
