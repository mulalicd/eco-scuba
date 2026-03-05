// src/hooks/useAIStream.ts
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreamParams {
    project_id: string;
    section_key: string;
    protocol: 'APA' | 'RIP' | 'RIP_FAZA_0' | 'WA';
    messages: Array<{ role: string; content: string }>;
    project_context: any;
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

        const timeoutId = setTimeout(() => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                console.warn('[Stream] Timeout nakon 120s — sekcija:', params.section_key);
            }
        }, 120000);

        setIsStreaming(true);
        setContent('');
        setError(null);
        let fullContent = '';

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Aktivna sesija nije pronađena. Molimo prijavite se ponovo.");

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const functionUrl = `${supabaseUrl}/functions/v1/ai-generate-section`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                    project_id: params.project_id,
                    section_key: params.section_key,
                    protocol: params.protocol,
                    messages: params.messages,
                    project_context: params.project_context
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
                throw new Error(errData.error || "Greška pri komunikaciji sa AI servisom.");
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Stream nije dostupan.");

            const decoder = new TextDecoder();
            let sseBuffer = '';

            const handleStreamEvent = (data: any) => {
                if (data.type === 'delta') {
                    fullContent += data.text;
                    setContent(fullContent);
                    return;
                }

                if (data.type === 'error') {
                    throw new Error(data.message || 'Greška tokom stream-a.');
                }

                if (data.type === 'done') {
                    fullContent = data.content || fullContent;
                    setContent(fullContent);
                }
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                sseBuffer += decoder.decode(value, { stream: true });
                const events = sseBuffer.split('\n\n');
                sseBuffer = events.pop() ?? '';

                for (const event of events) {
                    const lines = event.split('\n');
                    for (const line of lines) {
                        if (!line.startsWith('data:')) continue;

                        const payload = line.slice(5).trim();
                        if (!payload || payload === '[DONE]') continue;

                        let parsedEvent: any;
                        try {
                            parsedEvent = JSON.parse(payload);
                        } catch {
                            continue;
                        }

                        handleStreamEvent(parsedEvent);
                    }
                }
            }

            const remaining = sseBuffer.trim();
            if (remaining.startsWith('data:')) {
                const payload = remaining.slice(5).trim();
                if (payload && payload !== '[DONE]') {
                    let parsedEvent: any;
                    try {
                        parsedEvent = JSON.parse(payload);
                    } catch {
                        parsedEvent = null;
                    }

                    if (parsedEvent) {
                        handleStreamEvent(parsedEvent);
                    }
                }
            }

            return fullContent;
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.warn('[useAIStream] Request aborted');
                return fullContent;
            }
            setError(err.message);
            console.error("[useAIStream Error]:", err);
            return "";
        } finally {
            clearTimeout(timeoutId);
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, []);

    return {
        content,
        isStreaming,
        error,
        streamSection,
        cancel: () => {
            abortControllerRef.current?.abort();
            setIsStreaming(false);
        },
        reset: () => { setContent(''); setError(null); }
    };
}
