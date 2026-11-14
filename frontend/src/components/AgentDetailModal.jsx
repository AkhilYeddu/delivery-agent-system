import React from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Database,
  Zap,
} from 'lucide-react';
import { getStatusBadge, getVehicleIcon } from './AgentTable';

export const AgentDetailModal = ({
  agent,
  fromCache,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !agent) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return String(dateStr);
    }
  };

  const fullName = agent.full_name || 'Delivery Agent';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AG';

  const vehicleType = agent.vehicle_type || 'bike';
  const status = agent.status || 'active';
  const rating = Number(agent.rating || 5.0).toFixed(1);
  const completedDeliveries = agent.completed_deliveries ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-cream-200 shadow-creamy-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-cream-200 bg-cream-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cream-600">
              Delivery Agent Profile
            </span>
            {fromCache !== undefined && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  fromCache
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-cream-200 text-cream-800 border border-cream-300'
                }`}
              >
                {fromCache ? <Zap className="w-2.5 h-2.5 fill-emerald-600" /> : <Database className="w-2.5 h-2.5" />}
                {fromCache ? 'Redis Cache HIT' : 'Postgres Query'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cream-500 hover:text-cream-950 hover:bg-cream-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Agent Banner */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-caramel-600 to-caramel-400 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-caramel-500/20 shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-cream-950 font-display">
                  {fullName}
                </h3>
                {getStatusBadge(status)}
              </div>
              <p className="text-xs font-mono text-cream-500 mt-1">
                ID: <strong>{agent.id}</strong>
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cream-50/70 border border-cream-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cream-500">
                Rating
              </span>
              <div className="text-lg font-bold text-cream-950 mt-0.5 flex items-center justify-center gap-1">
                <span className="text-amber-500">★</span>
                <span>{rating}</span>
              </div>
            </div>

            <div className="bg-cream-50/70 border border-cream-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cream-500">
                Deliveries
              </span>
              <div className="text-lg font-bold text-cream-950 mt-0.5">
                {completedDeliveries}
              </div>
            </div>

            <div className="bg-cream-50/70 border border-cream-200 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cream-500">
                Transport
              </span>
              <div className="text-xs font-bold text-cream-900 mt-1 capitalize truncate flex items-center justify-center gap-1">
                {getVehicleIcon(vehicleType)}
                <span>{vehicleType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3 pt-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-xs font-medium text-cream-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cream-400" />
                Phone Number
              </span>
              <span className="font-semibold text-cream-900">{agent.phone || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-xs font-medium text-cream-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cream-400" />
                Email Address
              </span>
              <span className="font-semibold text-cream-900">{agent.email || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-xs font-medium text-cream-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cream-400" />
                Service Territory
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-cream-100 text-cream-800 border border-cream-200">
                {agent.service_area || 'General Area'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-cream-100">
              <span className="text-xs font-medium text-cream-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cream-400" />
                Registered On
              </span>
              <span className="text-xs text-cream-700">{formatDate(agent.created_at)}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-medium text-cream-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cream-400" />
                Last Synced
              </span>
              <span className="text-xs text-cream-700">{formatDate(agent.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDelete(agent);
            }}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition text-xs font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(agent);
              }}
              className="creamy-btn-secondary text-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button onClick={onClose} className="creamy-btn-primary text-xs">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
