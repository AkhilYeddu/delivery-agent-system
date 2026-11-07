import React from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  Truck,
  Edit3,
  Trash2,
  Database,
  Zap,
} from 'lucide-react';
import { DeliveryAgent } from '../types/agent';
import { getStatusBadge, getVehicleIcon } from './AgentTable';

interface AgentDetailModalProps {
  agent: DeliveryAgent | null;
  fromCache?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  fromCache,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !agent) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const initials = agent.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-cream-200 shadow-creamy-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
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
                  {agent.full_name}
                </h3>
                {getStatusBadge(agent.status)}
              </div>
              <p className="text-xs font-mono text-cream-500 mt-1">
                ID: {agent.id}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-cream-50/70 p-4 rounded-2xl border border-cream-200">
            <div>
              <span className="text-[11px] font-semibold text-cream-600 uppercase tracking-wider block mb-1">
                Performance Rating
              </span>
              <div className="flex items-center gap-1.5 text-base font-bold text-cream-950">
                <span className="text-amber-500 text-lg">★</span>
                <span>{Number(agent.rating).toFixed(1)} / 5.0</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-cream-600 uppercase tracking-wider block mb-1">
                Completed Trips
              </span>
              <div className="text-base font-bold text-cream-950">
                {agent.completed_deliveries.toLocaleString()} deliveries
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3.5 text-xs text-cream-800">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200">
              <span className="text-cream-500 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-cream-400" /> Phone
              </span>
              <a
                href={`tel:${agent.phone}`}
                className="font-semibold text-caramel-700 hover:underline"
              >
                {agent.phone}
              </a>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200">
              <span className="text-cream-500 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-cream-400" /> Email
              </span>
              <a
                href={`mailto:${agent.email}`}
                className="font-semibold text-caramel-700 hover:underline truncate max-w-[240px]"
              >
                {agent.email}
              </a>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200">
              <span className="text-cream-500 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cream-400" /> Service Area
              </span>
              <span className="font-semibold text-cream-900 bg-cream-100 px-2.5 py-0.5 rounded-lg border border-cream-200">
                {agent.service_area}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200">
              <span className="text-cream-500 font-medium flex items-center gap-2">
                <Truck className="w-4 h-4 text-cream-400" /> Assigned Vehicle
              </span>
              <div className="inline-flex items-center gap-1.5 font-semibold text-cream-900 capitalize">
                {getVehicleIcon(agent.vehicle_type)}
                <span>{agent.vehicle_type.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200">
              <span className="text-cream-500 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cream-400" /> Created At
              </span>
              <span className="font-mono text-cream-700">{formatDate(agent.created_at)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200">
              <span className="text-cream-500 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-cream-400" /> Last Updated
              </span>
              <span className="font-mono text-cream-700">{formatDate(agent.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-cream-200 bg-cream-50/40 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDelete(agent);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="creamy-btn-secondary text-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(agent);
              }}
              className="creamy-btn-primary flex items-center gap-1.5 text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Agent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
