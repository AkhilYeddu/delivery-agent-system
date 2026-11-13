import React from 'react';
import { Eye, Edit3, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { getStatusBadge, getVehicleIcon } from './AgentTable';

export const AgentCard = ({ agent, onView, onEdit, onDelete }) => {
  const initials = agent.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={() => onView(agent)}
      className="creamy-card p-5 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cream-200 to-cream-100 border border-cream-300 text-cream-800 font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-base text-cream-950 group-hover:text-caramel-700 transition">
                {agent.full_name}
              </h3>
              <p className="text-[11px] font-mono text-cream-500">{agent.id}</p>
            </div>
          </div>
          <div>{getStatusBadge(agent.status)}</div>
        </div>

        {/* Info items */}
        <div className="space-y-2 text-xs text-cream-700 my-4 pt-3 border-t border-cream-100">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-cream-400 shrink-0" />
            <span className="font-medium text-cream-900">{agent.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-cream-400 shrink-0" />
            <span className="truncate text-cream-600">{agent.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cream-400 shrink-0" />
            <span className="text-cream-800 font-medium">{agent.service_area}</span>
          </div>
        </div>
      </div>

      {/* Bottom fleet & actions */}
      <div
        className="pt-3 border-t border-cream-100 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 font-semibold text-cream-900">
            <span className="text-amber-500 font-bold">★</span>
            <span>{Number(agent.rating).toFixed(1)}</span>
          </div>
          <span className="text-cream-300">•</span>
          <div className="inline-flex items-center gap-1 text-cream-600 capitalize">
            {getVehicleIcon(agent.vehicle_type)}
            <span>{agent.vehicle_type.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(agent)}
            title="View Details"
            className="p-1.5 rounded-lg text-cream-600 hover:text-cream-950 hover:bg-cream-100 transition"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(agent)}
            title="Edit Agent"
            className="p-1.5 rounded-lg text-cream-600 hover:text-caramel-700 hover:bg-caramel-50 transition"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(agent)}
            title="Delete Agent"
            className="p-1.5 rounded-lg text-cream-600 hover:text-rose-700 hover:bg-rose-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

