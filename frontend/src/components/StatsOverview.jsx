import React from 'react';
import { Users, Truck, CheckCircle, Star } from 'lucide-react';

export const StatsOverview = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Agents',
      value: stats ? stats.totalAgents : '—',
      icon: Users,
      color: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
      badge: 'All Registered',
    },
    {
      title: 'Active on Duty',
      value: stats ? stats.byStatus.active : '—',
      icon: CheckCircle,
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
      badge: `${stats?.totalAgents ? Math.round((stats.byStatus.active / stats.totalAgents) * 100) : 0}% fleet`,
    },
    {
      title: 'On Delivery',
      value: stats ? stats.byStatus.on_delivery : '—',
      icon: Truck,
      color: 'bg-sky-500/10 text-sky-700 border-sky-200/50',
      badge: 'En Route',
    },
    {
      title: 'Average Rating',
      value: stats ? `${stats.avgRating.toFixed(1)} ★` : '—',
      icon: Star,
      color: 'bg-caramel-500/10 text-caramel-700 border-caramel-200/50',
      badge: `${stats?.totalDeliveries.toLocaleString() || 0} deliveries`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="creamy-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-cream-600">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-cream-950 font-display">
                {loading ? '...' : card.value}
              </span>
              <span className="text-xs font-medium text-cream-600 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

