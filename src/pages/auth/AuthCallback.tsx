import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                navigate("/dashboard");
            } else if (event === "SIGNED_OUT") {
                navigate("/login");
            }
        });
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
    );
}
