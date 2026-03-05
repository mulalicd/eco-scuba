import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreamParams {
    project_id: string;
    section_key: string;
    protocol: 'APA' | 'RIP' | 'RIP_FAZA_0' | 'WA';
    messages: Array<{ role: string; content: string }>;
    project_context: any;
    existing_sections?: Array<{ section_key: string; section_title_bs: string; content_html: string | null }>;
    change_request?: string;
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
                    project_context: params.project_context,
                    existing_sections: params.existing_sections || [],
                    change_request: params.change_request || '',
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

                        try {
                            const data = JSON.parse(payload);
                            if (data.type === 'delta') {
                                fullContent += data.text;
                                setContent(fullContent);
                            } else if (data.type === 'done') {
                                fullContent = data.content || fullContent;
                                setContent(fullContent);
                            } else if (data.type === 'error') {
                                throw new Error(data.message || 'Greška tokom stream-a.');
                            }
                        } catch (e) {
                            if (e instanceof SyntaxError) continue;
                            throw e;
                        }
                    }
                }
            }

            // Flush remaining buffer
            if (sseBuffer.trim()) {
                const lines = sseBuffer.split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    const payload = line.slice(5).trim();
                    if (!payload || payload === '[DONE]') continue;
                    try {
                        const data = JSON.parse(payload);
                        if (data.type === 'done') {
                            fullContent = data.content || fullContent;
                            setContent(fullContent);
                        } else if (data.type === 'delta') {
                            fullContent += data.text;
                            setContent(fullContent);
                        }
                    } catch { /* ignore */ }
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
