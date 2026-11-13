import React from 'react';
import { Eye, Edit3, Trash2, Bike, Car, Truck, Footprints, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';

export const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Active
        </span>
      );
    case 'on_delivery':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          On Delivery
        </span>
      );
    case 'inactive':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          Inactive
        </span>
      );
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          Suspended
        </span>
      );
    default:
      return null;
  }
};

export const getVehicleIcon = (vehicle) => {
  switch (vehicle) {
    case 'bike':
    case 'electric_bike':
      return <Bike className="w-3.5 h-3.5" />;
    case 'scooter':
      return <Bike className="w-3.5 h-3.5 text-caramel-600" />;
    case 'car':
      return <Car className="w-3.5 h-3.5 text-sky-600" />;
    case 'van':
      return <Truck className="w-3.5 h-3.5 text-purple-600" />;
    case 'walker':
      return <Footprints className="w-3.5 h-3.5 text-cream-600" />;
    default:
      return <Bike className="w-3.5 h-3.5" />;
  }
};

export const AgentTable = ({
  agents,
  loading,
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white border border-cream-200 rounded-2xl shadow-creamy overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream-50/70 border-b border-cream-200 text-[11px] font-bold uppercase tracking-wider text-cream-600">
              <th className="py-3.5 px-5">Agent</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Service Area</th>
              <th className="py-3.5 px-4">Vehicle</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Rating &amp; Fleet</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-cream-500 font-medium">
                  Loading delivery agents...
                </td>
              </tr>
            ) : agents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-cream-500 font-medium">
                  No delivery agents found matching criteria.
                </td>
              </tr>
            ) : (
              agents.map((agent) => {
                const initials = agent.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={agent.id}
                    onClick={() => onView(agent)}
                    className="hover:bg-cream-50/80 transition cursor-pointer group"
                  >
                    {/* Agent Name + ID */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cream-200 text-cream-800 font-bold text-xs flex items-center justify-center shrink-0 border border-cream-300">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-cream-900 group-hover:text-caramel-700 transition">
                            {agent.full_name}
                          </div>
                          <div className="text-[11px] font-mono text-cream-500">{agent.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-cream-900 font-medium">{agent.phone}</div>
                      <div className="text-[11px] text-cream-500 truncate max-w-[170px]">{agent.email}</div>
                    </td>

                    {/* Service Area */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-cream-100 text-cream-800 border border-cream-200">
                        {agent.service_area}
                      </span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 text-xs text-cream-700 font-medium capitalize">
                        {getVehicleIcon(agent.vehicle_type)}
                        <span>{agent.vehicle_type.replace('_', ' ')}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(agent.status)}</td>

                    {/* Rating & Completed */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-cream-900">
                          <span className="text-amber-500 font-bold">★</span>
                          <span>{Number(agent.rating).toFixed(1)}</span>
                        </span>
                        <span className="text-cream-300">•</span>
                        <span className="text-cream-600 font-mono text-[11px]">
                          {agent.completed_deliveries} deliv.
                        </span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(agent)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-cream-500 hover:text-cream-900 hover:bg-cream-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(agent)}
                          title="Edit Agent"
                          className="p-1.5 rounded-lg text-cream-500 hover:text-caramel-700 hover:bg-caramel-50 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(agent)}
                          title="Delete Agent"
                          className="p-1.5 rounded-lg text-cream-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-cream-50/50 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="py-1 px-2 border border-cream-200 rounded-lg bg-white text-cream-900 font-medium"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-cream-400">|</span>
          <span>
            Total: <strong>{total}</strong> delivery agents
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-cream-200 bg-white hover:bg-cream-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-cream-200 bg-white hover:bg-cream-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
