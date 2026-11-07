import React from 'react';
import { Eye, Edit3, Trash2, Bike, Car, Truck, Footprints, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { DeliveryAgent, AgentStatus, VehicleType } from '../types/agent';

interface AgentTableProps {
  agents: DeliveryAgent[];
  loading?: boolean;
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onView: (agent: DeliveryAgent) => void;
  onEdit: (agent: DeliveryAgent) => void;
  onDelete: (agent: DeliveryAgent) => void;
}

export const getStatusBadge = (status: AgentStatus) => {
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
  }
};

export const getVehicleIcon = (vehicle: VehicleType) => {
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
  }
};

export const AgentTable: React.FC<AgentTableProps> = ({
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
                <td colSpan={7} className="py-16 text-center">
                  <div className="max-w-xs mx-auto text-cream-600">
                    <p className="font-semibold text-cream-900 text-base">No agents found</p>
                    <p className="text-xs text-cream-500 mt-1">
                      Try adjusting your search criteria or add a new delivery agent.
                    </p>
                  </div>
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
                    className="hover:bg-cream-50/60 transition-colors group cursor-pointer"
                    onClick={() => onView(agent)}
                  >
                    {/* Agent avatar & name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cream-200 to-cream-100 border border-cream-300 text-cream-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-cream-950 group-hover:text-caramel-700 transition-colors">
                            {agent.full_name}
                          </div>
                          <div className="text-[11px] font-mono text-cream-500">
                            {agent.id}
                          </div>
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
                      <span className="inline-block text-xs font-medium text-cream-800 bg-cream-100 px-2.5 py-1 rounded-lg border border-cream-200">
                        {agent.service_area}
                      </span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 text-xs text-cream-800 capitalize font-medium">
                        {getVehicleIcon(agent.vehicle_type)}
                        <span>{agent.vehicle_type.replace('_', ' ')}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(agent.status)}</td>

                    {/* Rating & completed */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-cream-900">
                        <span className="text-amber-500 font-bold">★</span>
                        <span>{Number(agent.rating).toFixed(1)}</span>
                      </div>
                      <div className="text-[11px] text-cream-500">
                        {agent.completed_deliveries.toLocaleString()} orders
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td
                      className="py-3.5 px-5 text-right"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering onView row click
                    >
                      <div className="flex items-center justify-end gap-1">
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-cream-50/50 border-t border-cream-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-700">
        <div className="flex items-center gap-3">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="py-1 px-2.5 bg-white border border-cream-200 rounded-lg text-cream-800 font-medium focus:outline-none focus:border-caramel-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-cream-500">
            Total {total} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium mr-2">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-cream-200 bg-white text-cream-700 hover:bg-cream-100 disabled:opacity-40 disabled:hover:bg-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-cream-200 bg-white text-cream-700 hover:bg-cream-100 disabled:opacity-40 disabled:hover:bg-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

