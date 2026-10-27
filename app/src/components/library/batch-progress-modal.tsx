import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import { BatchJob, BatchJobItem } from '@/types';
import { pipelineApi } from '@/lib/api/pipeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BatchProgressModalProps {
  batchId: string | null;
  isOpen: boolean;
  onClose: () => void;
  paperTitlesById?: Record<string, string>;
}

export function BatchProgressModal({
  batchId,
  isOpen,
  onClose,
  paperTitlesById = {},
}: BatchProgressModalProps) {
  const [batch, setBatch] = useState<BatchJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !batchId) {
      setBatch(null);
      setError(null);
      return;
    }

    let isMounted = true;
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchStatus = async () => {
      try {
        const data = await pipelineApi.getBatchStatus(batchId);
        if (isMounted) {
          setBatch(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load batch status');
        }
      }
    };

    fetchStatus();

    // Setup SSE connection
    try {
      const sseUrl = `/api/v1/pipeline/batch/${batchId}/stream`;
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data: BatchJob = JSON.parse(event.data);
          if (isMounted) {
            setBatch(data);
          }
          if (['completed', 'failed', 'partial'].includes(data.status)) {
            eventSource?.close();
          }
        } catch {
          // Parse error, fallback to polling
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        // Fallback polling if SSE fails
        pollInterval = setInterval(fetchStatus, 2000);
      };
    } catch {
      pollInterval = setInterval(fetchStatus, 2000);
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [batchId, isOpen]);

  if (!isOpen || !batchId) return null;

  const total = batch?.total_papers || 0;
  const completed = batch?.completed_papers || 0;
  const failed = batch?.failed_papers || 0;
  const finished = completed + failed;
  const progressPercent = total > 0 ? Math.round((finished / total) * 100) : 0;

  const isDone = batch && ['completed', 'failed', 'partial'].includes(batch.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              Batch Pipeline Execution
              {batch && <StatusBadge status={batch.status} />}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isDone
                ? `Finished processing ${total} papers (${completed} succeeded, ${failed} failed)`
                : `Processing paper ${finished} of ${total} concurrently (max 3 parallel)…`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md border border-destructive/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  batch?.status === 'failed'
                    ? 'bg-destructive'
                    : batch?.status === 'partial'
                    ? 'bg-amber-500'
                    : 'bg-primary',
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Papers ({batch?.items.length || 0})
            </span>
            <div className="space-y-2">
              {batch?.items.map((item) => (
                <BatchItemRow
                  key={item.id}
                  item={item}
                  title={paperTitlesById[item.paper_id] || `Paper ID: ${item.paper_id.slice(0, 8)}…`}
                />
              ))}
            </div>
          </div>

          {batch?.status === 'partial' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Partial failure encountered</p>
                <p className="text-[11px] opacity-90">
                  Some papers failed during processing, but successful paper results were saved.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-secondary/20">
          <Button onClick={onClose} variant={isDone ? 'default' : 'outline'} size="sm">
            {isDone ? 'Close' : 'Dismiss to Background'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BatchJob['status'] }) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-500 font-bold text-[10px]">
          COMPLETED
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 font-bold text-[10px]">
          PARTIAL FAILURE
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="secondary" className="bg-destructive/15 text-destructive font-bold text-[10px]">
          FAILED
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="secondary" className="bg-primary/20 text-primary font-bold text-[10px] animate-pulse">
          PROCESSING
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold text-[10px]">
          PENDING
        </Badge>
      );
  }
}

function BatchItemRow({ item, title }: { item: BatchJobItem; title: string }) {
  return (
    <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center justify-between gap-3 text-xs">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="font-semibold truncate">{title}</p>
        {item.error && (
          <p className="text-[11px] text-destructive truncate">{item.error}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-1.5 font-bold uppercase text-[10px]">
        {item.status === 'completed' && (
          <span className="text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        )}
        {item.status === 'failed' && (
          <span className="text-destructive flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        )}
        {item.status === 'processing' && (
          <span className="text-primary flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        )}
        {item.status === 'pending' && (
          <span className="text-muted-foreground">Queued</span>
        )}
      </div>
    </div>
  );
}
