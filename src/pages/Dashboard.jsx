import React, { useState, useEffect } from 'react';
import { RiArrowRightUpLine, RiTimeLine, RiExchangeDollarLine, RiUserAddLine, RiPieChartLine, RiFundsLine } from 'react-icons/ri';
import KPICard from '../components/ui/KPICard';
import { SkeletonCard, SkeletonChart } from '../components/ui/SkeletonLoader';
import AreaChartComponent from '../components/charts/AreaChart';
import BarChartComponent from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import PageHeader from '../components/ui/PageHeader';
import { kpiData, chartData, recentActivity } from '../data/mockData';

const activityIcons = {
  deposit: { icon: RiArrowRightUpLine, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  withdrawal: { icon: RiExchangeDollarLine, color: 'text-orange-500', bg: 'bg-orange-50' },
  user: { icon: RiUserAddLine, color: 'text-blue-500', bg: 'bg-blue-50' },
  roi: { icon: RiFundsLine, color: 'text-purple-500', bg: 'bg-purple-50' },
  plan: { icon: RiPieChartLine, color: 'text-gold-500', bg: 'bg-gold-50' },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Super Admin Intelligence Portal"
        subtitle="Global platform liquidity, active asset AUM, investor metrics & real-time streaming ledger"
        badge="Live Operations"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.map((kpi, i) => (
          <KPICard key={kpi.id} {...kpi} delay={i * 80} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Investment Trends */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800 font-poppins">Investment Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly investment inflow trajectory</p>
            </div>
            <span className="badge-gold badge text-xs font-semibold">2026</span>
          </div>
          <AreaChartComponent data={chartData.investment} dataKey="amount" color="#C8A200" />
        </div>

        {/* User Growth */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800 font-poppins">User Growth</h3>
              <p className="text-xs text-slate-400 mt-0.5">Platform investor registrations</p>
            </div>
            <span className="badge-gold badge text-xs font-semibold">2026</span>
          </div>
          <BarChartComponent data={chartData.userGrowth} dataKey="users" color="#10B981" />
        </div>

        {/* Revenue & Asset Breakdown */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-800 font-poppins">Portfolio Asset Allocation</h3>
              <p className="text-xs text-slate-400 mt-0.5">Capital distribution by investment sector</p>
            </div>
            <span className="badge-gold badge text-xs font-semibold">AUM Share</span>
          </div>
          <DonutChart data={chartData.assetDistribution} />
        </div>

        {/* Recent Activity */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Recent Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest platform events</p>
            </div>
            <button className="text-xs font-medium text-gold-500 hover:text-gold-600 transition-colors">View all</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map(activity => {
              const config = activityIcons[activity.type] || activityIcons.deposit;
              const Icon = config.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{activity.action}</p>
                    <p className="text-xs text-gray-400 truncate">{activity.detail}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                    <RiTimeLine size={12} />
                    <span>{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
