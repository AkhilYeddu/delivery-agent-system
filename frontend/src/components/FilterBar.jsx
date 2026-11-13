import React from 'react';
import { Search, LayoutGrid, LayoutList, X } from 'lucide-react';

export const FilterBar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  serviceArea,
  onServiceAreaChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  viewMode,
  onViewModeChange,
  availableAreas,
  totalResults,
}) => {
  const statuses = [
    { label: 'All Agents', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'On Delivery', value: 'on_delivery' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
  ];

  return (
    <div className="bg-white border border-cream-200 rounded-2xl p-4 shadow-creamy space-y-4">
      {/* Top row: search & view switcher */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-500" />
          <input
            type="text"
            placeholder="Search by agent name, email, phone, or area..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-cream-50/60 border border-cream-200 rounded-xl text-sm text-cream-900 placeholder:text-cream-400 focus:outline-none focus:bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/15 transition"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Service Area Select */}
          <select
            value={serviceArea}
            onChange={(e) => onServiceAreaChange(e.target.value)}
            className="text-xs font-medium py-2.5 px-3 bg-cream-50 border border-cream-200 rounded-xl text-cream-800 focus:outline-none focus:border-caramel-500"
          >
            <option value="all">All Service Areas</option>
            {availableAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          {/* Sort By Select */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="text-xs font-medium py-2.5 px-3 bg-cream-50 border border-cream-200 rounded-xl text-cream-800 focus:outline-none focus:border-caramel-500"
          >
            <option value="created_at">Date Joined</option>
            <option value="full_name">Agent Name</option>
            <option value="rating">Rating</option>
            <option value="completed_deliveries">Deliveries</option>
          </select>

          {/* Sort Direction Toggle */}
          <button
            onClick={onSortOrderToggle}
            title={`Sort order: ${sortOrder.toUpperCase()}`}
            className="px-3 py-2.5 text-xs font-semibold bg-cream-50 border border-cream-200 rounded-xl text-cream-800 hover:bg-cream-100 transition"
          >
            {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
          </button>

          {/* View mode switcher */}
          <div className="flex items-center border border-cream-200 rounded-xl p-1 bg-cream-50/60">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white shadow-sm text-caramel-700' : 'text-cream-500 hover:text-cream-900'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-caramel-700' : 'text-cream-500 hover:text-cream-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: status pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-cream-100">
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => onStatusChange(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                status === s.value
                  ? 'bg-cream-900 text-cream-50 font-semibold shadow-sm'
                  : 'bg-cream-50 text-cream-700 hover:bg-cream-100 border border-cream-200/60'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-cream-500 font-medium">
          Showing <strong className="text-cream-900 font-bold">{totalResults}</strong> matching agents
        </div>
      </div>
    </div>
  );
};
