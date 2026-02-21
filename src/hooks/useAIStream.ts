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
    const abortRef = useRef<AbortController | null>(null);

    const streamSection = useCallback(async (params: StreamParams): Promise<string> => {
        // Cancel any existing stream
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setIsStreaming(true);
        setContent('');
        setError(null);
        let fullContent = '';

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Session expired — please log in again');

            // Note: We use the actual base URL from environment
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const response = await fetch(
                `${supabaseUrl}/functions/v1/ai-generate-section`,
                {
                    method: 'POST',
                    signal: abortRef.current.signal,
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(params),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
                throw new Error(err.error || `HTTP ${response.status}`);
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                for (const line of chunk.split('\n')) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (!data) continue;

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.type === 'delta' && parsed.text) {
                            fullContent += parsed.text;
                            setContent(fullContent);
                        }
                        if (parsed.type === 'done') {
                            setIsStreaming(false);
                            return fullContent;
                        }
                    } catch { /* skip malformed SSE lines */ }
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return '';
            const msg = err instanceof Error ? err.message : 'Nepoznata greška';
            setError(msg);
        } finally {
            setIsStreaming(false);
        }

        return fullContent;
    }, []);

    const cancel = useCallback(() => {
        abortRef.current?.abort();
        setIsStreaming(false);
    }, []);

    const reset = useCallback(() => {
        setContent('');
        setError(null);
        setIsStreaming(false);
    }, []);

    return { content, isStreaming, error, streamSection, cancel, reset };
}
