import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CacheTelemetryBadge } from './components/CacheTelemetryBadge';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { AgentTable } from './components/AgentTable';
import { AgentCard } from './components/AgentCard';
import { AgentFormModal } from './components/AgentFormModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer } from './components/Toast';
import { agentApi } from './services/api';

export const App = () => {
  // Data state
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Query / Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [serviceArea, setServiceArea] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');

  // Loading & cache telemetry
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastQueryMeta, setLastQueryMeta] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState(null);
  const [agentToView, setAgentToView] = useState(null);
  const [viewFromCache, setViewFromCache] = useState(undefined);
  const [agentToDelete, setAgentToDelete] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, description) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch agents list
  const loadAgents = useCallback(
    async (pageToLoad = pagination.page, limitToLoad = pagination.limit) => {
      setLoading(true);
      try {
        const res = await agentApi.getAgents({
          page: pageToLoad,
          limit: limitToLoad,
          status,
          service_area: serviceArea,
          search,
          sortBy,
          sortOrder,
        });

        setAgents(res.data);
        setPagination(res.pagination);
        setLastQueryMeta(res.meta);
      } catch (err) {
        addToast('error', 'Failed to load delivery agents', err.message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, status, serviceArea, search, sortBy, sortOrder]
  );

  // Fetch dashboard stats & telemetry
  const loadTelemetryAndStats = useCallback(async () => {
    try {
      const [statsRes, telemetryRes] = await Promise.all([
        agentApi.getStats(),
        agentApi.getCacheTelemetry(),
      ]);
      setStats(statsRes.data);
      setTelemetry(telemetryRes);
    } catch (err) {
      console.warn('Telemetry load failed:', err.message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAgents(1);
    loadTelemetryAndStats();
  }, [status, serviceArea, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAgents(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAgents(pagination.page), loadTelemetryAndStats()]);
    setRefreshing(false);
    addToast('info', 'Data refreshed', 'Synced latest agents and cache statistics.');
  };

  // Detail view handler
  const handleViewAgent = async (agent) => {
    try {
      const res = await agentApi.getAgentById(agent.id);
      setAgentToView(res.data);
      setViewFromCache(res.meta?.fromCache);
    } catch {
      setAgentToView(agent);
      setViewFromCache(undefined);
    }
  };

  // Create or Update handler
  const handleSaveAgent = async (payload) => {
    if (agentToEdit) {
      await agentApi.updateAgent(agentToEdit.id, payload);
      addToast(
        'success',
        'Delivery agent updated',
        `Updated ${payload.full_name}. Cache invalidated for list and agent detail.`
      );
    } else {
      await agentApi.createAgent(payload);
      addToast(
        'success',
        'Delivery agent created',
        `Added ${payload.full_name} to fleet. Cache invalidated for list and stats.`
      );
    }
    await Promise.all([loadAgents(1), loadTelemetryAndStats()]);
  };

  // Delete handler
  const handleDeleteAgent = async (id) => {
    await agentApi.deleteAgent(id);
    addToast(
      'success',
      'Delivery agent removed',
      `Record removed from database and evicted from Redis cache.`
    );
    await Promise.all([loadAgents(pagination.page), loadTelemetryAndStats()]);
  };

  // Flush Redis cache handler
  const handleFlushCache = async () => {
    await agentApi.flushCache();
    await loadTelemetryAndStats();
    addToast(
      'info',
      'Redis cache flushed',
      'All cached lists and agent details have been purged. Next request will be a cache MISS.'
    );
  };

  // Extract distinct service areas for filter dropdown
  const availableAreas = useMemo(() => {
    if (stats?.topAreas && stats.topAreas.length > 0) {
      return stats.topAreas.map((a) => a.area);
    }
    const set = new Set(agents.map((a) => a.service_area));
    return Array.from(set);
  }, [stats, agents]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Creamy Navbar */}
      <Navbar
        onOpenCreate={() => {
          setAgentToEdit(null);
          setIsFormOpen(true);
        }}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Redis Cache Telemetry Panel */}
        <CacheTelemetryBadge
          telemetry={telemetry}
          lastQueryCache={lastQueryMeta?.fromCache}
          lastLatencyMs={lastQueryMeta?.durationMs}
          onFlushCache={handleFlushCache}
        />

        {/* Fleet KPI Metric Cards */}
        <StatsOverview stats={stats} loading={loading && !stats} />

        {/* Filter, Search & View Controls */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          serviceArea={serviceArea}
          onServiceAreaChange={setServiceArea}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderToggle={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          availableAreas={availableAreas}
          totalResults={pagination.total}
        />

        {/* Content View: Table or Grid */}
        {viewMode === 'table' ? (
          <AgentTable
            agents={agents}
            loading={loading}
            page={pagination.page}
            totalPages={pagination.totalPages}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={(p) => loadAgents(p, pagination.limit)}
            onLimitChange={(l) => loadAgents(1, l)}
            onView={handleViewAgent}
            onEdit={(agent) => {
              setAgentToEdit(agent);
              setIsFormOpen(true);
            }}
            onDelete={(agent) => setAgentToDelete(agent)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onView={handleViewAgent}
                onEdit={(a) => {
                  setAgentToEdit(a);
                  setIsFormOpen(true);
                }}
                onDelete={(a) => setAgentToDelete(a)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-cream-200 bg-white/60 py-6 text-center text-xs text-cream-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>SwiftDispatch</strong> • Candidate Project: Delivery Agent Management System
          </span>
          <span className="font-mono text-[11px] text-cream-500">
            Node.js API • PostgreSQL • Redis Caching • Smooth &amp; Creamy UI
          </span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <AgentFormModal
        isOpen={isFormOpen}
        agentToEdit={agentToEdit}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveAgent}
      />

      <AgentDetailModal
        isOpen={Boolean(agentToView)}
        agent={agentToView}
        fromCache={viewFromCache}
        onClose={() => setAgentToView(null)}
        onEdit={(a) => {
          setAgentToEdit(a);
          setIsFormOpen(true);
        }}
        onDelete={(a) => setAgentToDelete(a)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(agentToDelete)}
        agent={agentToDelete}
        onClose={() => setAgentToDelete(null)}
        onConfirm={handleDeleteAgent}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

