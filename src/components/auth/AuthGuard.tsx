// src/components/auth/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setSession } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/login', { state: { from: location.pathname }, replace: true });
      }
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location, setSession, setUser]);

  if (checking) return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <p className="text-text-muted text-sm font-medium">Provjera autentikacije...</p>
      </div>
    </div>
  );

  return <>{children}</>;
}
