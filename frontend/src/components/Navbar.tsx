import React from 'react';
import { Package, Plus, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenCreate: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreate, onRefresh, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-caramel-600 to-caramel-400 flex items-center justify-center shadow-md shadow-caramel-500/20 text-white">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-cream-900">
                SwiftDispatch
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-cream-200 text-cream-800 px-2 py-0.5 rounded-full border border-cream-300">
                v1.0
              </span>
            </div>
            <p className="text-xs text-cream-600 font-medium">
              Delivery Agent Management System • PostgreSQL &amp; Redis
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-cream-200 text-cream-700 bg-white hover:bg-cream-100 hover:text-cream-900 hover:border-cream-300 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenCreate}
            className="creamy-btn-primary flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Agent</span>
          </button>
        </div>
      </div>
    </header>
  );
};

