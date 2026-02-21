// src/hooks/useAIStream.ts
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreamParams {
    project_id: string;
    section_key: string;
    protocol: 'APA' | 'RIP' | 'WA';
    messages: Array<{ role: string; content: string }>;
    project_context: object;
}

export function useAIStream() {
    const [content, setContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const streamSection = useCallback(async (params: StreamParams): Promise<string> => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsStreaming(true);
        setContent('');
        setError(null);
        let fullContent = '';

        const runStream = async (retryCount = 0): Promise<string> => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                await supabase.auth.signOut();
                throw new Error('Sesija je nevažeća. Molim se ponovo prijavite.');
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            console.log(`[Auth] Sending request (retry=${retryCount}), token starts: ${session.access_token.substring(0, 30)}...`);

            const response = await fetch(
                `${supabaseUrl}/functions/v1/ai-generate-section`,
                {
                    method: 'POST',
                    signal: abortControllerRef.current?.signal,
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                    },
                    body: JSON.stringify(params),
                }
            );

            if (!response.ok) {
                // Always read the server's actual error message for debugging
                let serverError = `HTTP greška: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    console.error('[Auth] Server error body:', JSON.stringify(errorBody));
                    serverError = errorBody.details || errorBody.error || serverError;
                } catch { /* ignore parse errors */ }

                if (response.status === 401 && retryCount === 0) {
                    console.warn('[Auth] 401 on first attempt. Forcing token refresh...');
                    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

                    if (refreshError || !refreshData.session) {
                        console.error('[Auth] Refresh failed:', refreshError?.message);
                        await supabase.auth.signOut();
                        throw new Error('Sesija je istekla. Molim se ponovo prijavite.');
                    }
                    console.log('[Auth] Token refreshed. Retrying with new token...');
                    return runStream(1);
                }

                if (response.status === 401 && retryCount >= 1) {
                    // Refresh didn't help — force full re-login
                    console.error('[Auth] 401 persists after token refresh. Signing out.');
                    await supabase.auth.signOut();
                    throw new Error('Autentifikacija nije uspjela ni nakon osvježavanja sesije. Molim se ponovo prijavite.');
                }

                throw new Error(serverError);
            }

            if (!response.body) throw new Error('Odgovor nema tijelo');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data: ')) continue;

                        const data = trimmed.slice(6).trim();
                        if (!data || data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'delta' && typeof parsed.text === 'string') {
                                fullContent += parsed.text;
                                setContent(prev => prev + parsed.text);
                            }
                            if (parsed.type === 'error') throw new Error(parsed.message);
                        } catch (e) { /* skip malformed SSE lines */ }
                    }
                }
            } finally {
                reader.releaseLock();
            }

            return fullContent;
        };

        try {
            return await runStream();
        } catch (err: any) {
            if (err.name === 'AbortError') return fullContent;
            setError(err.message);
            console.error('[useAIStream] Greška:', err.message);
            return fullContent;
        } finally {
            setIsStreaming(false);
        }

        return fullContent;
    }, []);

    const cancel = useCallback(() => {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
    }, []);

    const reset = useCallback(() => {
        setContent('');
        setError(null);
        setIsStreaming(false);
    }, []);

    return { content, isStreaming, error, streamSection, cancel, reset };
}
