import { useEffect, useRef } from 'react';
import { refreshDocumentStatus } from '../../../../services/api/aiAgentService';
import type { KnowledgeBaseDocumentResponseDTO } from '../../../../types/aiAgent.types';
import { isTransitionalStatus } from '../utils/documentStatus';

interface UseKbStatusPollingOptions {
  documents: KnowledgeBaseDocumentResponseDTO[];
  enabled?: boolean;
  intervalMs?: number;
  maxBackoffMs?: number;
  onUpdate: (doc: KnowledgeBaseDocumentResponseDTO) => void;
}

export function useKbStatusPolling({
  documents,
  enabled = true,
  intervalMs = 5000,
  maxBackoffMs = 30000,
  onUpdate,
}: UseKbStatusPollingOptions) {
  const docsRef = useRef(documents);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    docsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let backoff = 0;

    const schedule = (delay: number) => {
      if (stopped) return;
      timer = setTimeout(tick, delay);
    };

    const tick = async () => {
      timer = null;
      if (stopped) return;
      if (document.visibilityState !== 'visible') {
        schedule(intervalMs);
        return;
      }
      const transitional = docsRef.current.filter((d) => isTransitionalStatus(d.status));
      if (transitional.length === 0) {
        schedule(intervalMs);
        return;
      }
      try {
        const results = await Promise.allSettled(
          transitional.map((d) => refreshDocumentStatus(d.id))
        );
        if (stopped) return;
        backoff = 0;
        for (const r of results) {
          if (r.status === 'fulfilled') {
            onUpdateRef.current(r.value);
          }
        }
        schedule(intervalMs);
      } catch {
        if (stopped) return;
        backoff = Math.min(backoff > 0 ? backoff * 2 : intervalMs * 2, maxBackoffMs);
        schedule(backoff);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && timer == null && !stopped) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    schedule(intervalMs);

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs, maxBackoffMs]);
}
