import { useEffect, useRef, useState } from 'react';
import { getIndexingJobStatus } from '../../../../services/api/aiAgentService';
import type { IndexingJobStatusResponseDTO } from '../../../../types/aiAgent.types';

const TERMINAL_STATUSES = new Set(['SUCCEEDED', 'COMPLETED', 'INDEXED', 'FAILED', 'ERROR']);

const isTerminal = (status?: string | null): boolean => {
  if (!status) return false;
  return TERMINAL_STATUSES.has(status.toUpperCase());
};

interface UseIndexingJobOptions {
  jobId: string | null;
  intervalMs?: number;
  onTerminal?: (job: IndexingJobStatusResponseDTO) => void;
}

interface UseIndexingJobResult {
  status: IndexingJobStatusResponseDTO | null;
  polling: boolean;
  done: boolean;
}

export function useIndexingJob({
  jobId,
  intervalMs = 5000,
  onTerminal,
}: UseIndexingJobOptions): UseIndexingJobResult {
  const [status, setStatus] = useState<IndexingJobStatusResponseDTO | null>(null);
  const [polling, setPolling] = useState(false);
  const [done, setDone] = useState(false);
  const onTerminalRef = useRef(onTerminal);

  useEffect(() => {
    onTerminalRef.current = onTerminal;
  }, [onTerminal]);

  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      setPolling(false);
      setDone(false);
      return;
    }

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    setPolling(true);
    setDone(false);

    const tick = async () => {
      timer = null;
      if (stopped) return;
      if (document.visibilityState !== 'visible') {
        timer = setTimeout(tick, intervalMs);
        return;
      }
      try {
        const data = await getIndexingJobStatus(jobId);
        if (stopped) return;
        setStatus(data);
        if (isTerminal(data.status)) {
          setPolling(false);
          setDone(true);
          onTerminalRef.current?.(data);
          return;
        }
      } catch {
        // backoff manejado a nivel del intervalo
      }
      timer = setTimeout(tick, intervalMs);
    };

    tick();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, intervalMs]);

  return { status, polling, done };
}
