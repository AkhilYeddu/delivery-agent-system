import React, { useState } from 'react';
import { Database, Zap, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { CacheTelemetry } from '../types/agent';

interface CacheTelemetryBadgeProps {
  telemetry: CacheTelemetry | null;
  lastQueryCache?: boolean;
  lastLatencyMs?: number;
  onFlushCache: () => Promise<void>;
}

export const CacheTelemetryBadge: React.FC<CacheTelemetryBadgeProps> = ({
  telemetry,
  lastQueryCache,
  lastLatencyMs,
  onFlushCache,
}) => {
  const [isFlushing, setIsFlushing] = useState(false);

  const handleFlush = async () => {
    setIsFlushing(true);
    try {
      await onFlushCache();
    } finally {
      setIsFlushing(false);
    }
  };

  return (
    <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-creamy flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Redis Connection Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
          <Zap className="w-5 h-5 fill-amber-500/20" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cream-600">
              Redis Caching Layer
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                telemetry?.status === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetry?.status === 'connected' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                }`}
              />
              {telemetry?.type || 'Active'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-cream-700 font-medium">
            <span>
              Hit Rate: <strong className="text-cream-900">{telemetry?.hitRate || '0%'}</strong>
            </span>
            <span>•</span>
            <span>
              Hits: <strong className="text-emerald-700">{telemetry?.hits || 0}</strong>
            </span>
            <span>•</span>
            <span>
              Misses: <strong className="text-amber-700">{telemetry?.misses || 0}</strong>
            </span>
            <span>•</span>
            <span>
              Cached Keys: <strong className="text-cream-900">{telemetry?.keysCount || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Query cache status & Flush cache button */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-cream-100">
        {lastQueryCache !== undefined && (
          <div
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border font-medium ${
              lastQueryCache
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-cream-100/80 border-cream-200 text-cream-800'
            }`}
          >
            {lastQueryCache ? (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Last Query: <strong>Redis HIT</strong></span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-cream-700" />
                <span>Last Query: <strong>PostgreSQL MISS</strong></span>
              </>
            )}
            {lastLatencyMs !== undefined && (
              <span className="text-[11px] opacity-75">({lastLatencyMs}ms)</span>
            )}
          </div>
        )}

        <button
          onClick={handleFlush}
          disabled={isFlushing}
          title="Clear all Redis cache entries to test cold cache retrieval"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isFlushing ? 'Flushing...' : 'Flush Cache'}</span>
        </button>
      </div>
    </div>
  );
};

