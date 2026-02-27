// src/hooks/useAIStream.ts
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
// import { APA_SYSTEM_PROMPT } from '@/lib/apa-system-prompt'; // Uklonjeno iz runtime-a radi uštede tokena (Fix #1)

interface StreamParams {
    project_id: string;
    section_key: string;
    protocol: 'APA' | 'RIP' | 'RIP_FAZA_0' | 'WA';
    messages: Array<{ role: string; content: string }>;
    project_context: any;
}

// ⚠️ ZAKLJUČAK NAKON E2E TESTOVA (2026-02-22):
// - gemini-2.0-flash i gemini-2.0-flash-lite su jedini modeli koji rade (vraćaju 429 kad nestane kvote, što znači da putanja postoji).
// - gemini-1.5-flash serija dosljedno vraća 404 na i na v1 i na v1beta za ove ključeve.
// - Povećavamo sleep na 2000ms za bolji fallback zbog 15 RPM ograničenja besplatnih ključeva.
const MODEL_MAP: { model: string; apiVersion: string }[] = [
    { model: 'gemini-2.0-flash', apiVersion: 'v1beta' },
    { model: 'gemini-2.0-flash-lite', apiVersion: 'v1beta' },
];

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

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
                console.warn('[Stream] Timeout nakon 30s — sekcija:', params.section_key);
            }
        }, 30000);

        setIsStreaming(true);
        setContent('');
        setError(null);
        let fullContent = '';

        try {
            // 🚀 NEW: Rerouting through Supabase Edge Function for Claude Fallback & Stability
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Aktivna sesija nije pronađena. Molimo prijavite se ponovo.");

            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-section`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
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
                const errData = await response.json();
                throw new Error(errData.error || "Greška pri komunikaciji sa AI servisom.");
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Stream nije dostupan.");

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'delta') {
                                fullContent += data.text;
                                setContent(fullContent);
                            } else if (data.type === 'error') {
                                throw new Error(data.message);
                            } else if (data.type === 'done') {
                                fullContent = data.content;
                                setContent(fullContent);
                            }
                        } catch (e) {
                            // Tiho preskoči ako nije validan JSON (npr. prazne linije)
                        }
                    }
                }
            }

            return fullContent;
        } catch (err: any) {
            // 🚨 FALLBACK: Try Groq directly from frontend if Edge Function fails
            console.warn("[useAIStream] EF Failed, trying Groq fallback...", err);

            const GROQ_MODEL = 'llama-3.3-70b-versatile';
            const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
            const groqKeys: string[] = JSON.parse(import.meta.env.VITE_GROQ_API_KEYS || '[]');

            const systemInstructions: Record<string, string> = {
                'APA': 'Ti si asistent za pisanje projektnih prijedloga. Postavljaj jedno po jedno pitanje korisniku.',
                'RIP': 'Ti si ekspert za pisanje projektnih prijedloga. Generiši traženu sekciju u HTML formatu.',
                'RIP_FAZA_0': 'Analiziraj projektni poziv i vrati eligibility analizu u HTML.',
                'WA': 'Harmonizuj projektni prijedlog prema izmjenama.'
            };
            const systemContent = systemInstructions[params.protocol] || 'Ti si AI asistent za projektne prijedloge.';

            for (const groqKey of groqKeys.sort(() => Math.random() - 0.5)) {
                try {
                    const groqResponse = await fetch(GROQ_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${groqKey}`
                        },
                        body: JSON.stringify({
                            model: GROQ_MODEL,
                            messages: [
                                { role: 'system', content: systemContent },
                                ...params.messages.map(m => ({ role: m.role, content: m.content }))
                            ],
                            max_tokens: 2048,
                            temperature: 0.7,
                            stream: true
                        }),
                        signal: abortControllerRef.current?.signal
                    });

                    if (groqResponse.status === 429) continue;
                    if (!groqResponse.ok) break;

                    const reader = groqResponse.body!.getReader();
                    const decoder = new TextDecoder();
                    let fullText = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
                        for (const line of lines) {
                            const data = line.replace('data: ', '').trim();
                            if (data === '[DONE]') continue;
                            try {
                                const parsed = JSON.parse(data);
                                const delta = parsed.choices?.[0]?.delta?.content ?? '';
                                if (delta) {
                                    fullText += delta;
                                    setContent(fullText);
                                }
                            } catch (e) { }
                        }
                    }

                    if (fullText) {
                        console.log('[Oracle] ✅ Uspješno! Provider: Groq | Model:', GROQ_MODEL);
                        return fullText;
                    }
                } catch (groqErr: any) {
                    if (groqErr.name === 'AbortError') {
                        console.warn('[Groq Fallback] Request aborted due to timeout or user cancellation.');
                        return fullContent; // Return current content if aborted
                    }
                    console.warn('[Groq Fallback] Error:', groqErr);
                    continue;
                }
            }

            setError(err.message);
            console.error("[useAIStream Final Error]:", err);
            return "";
        } finally {
            clearTimeout(timeoutId);
            setIsStreaming(false);
            abortControllerRef.current = null; // Clean up the AbortController
        }
    }, []);


    return {
        content,
        isStreaming,
        error,
        streamSection,
        cancel: () => setIsStreaming(false),
        reset: () => { setContent(''); setError(null); }
    };
}

