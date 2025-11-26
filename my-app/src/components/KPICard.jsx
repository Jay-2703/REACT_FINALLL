import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line as RechartLine, ResponsiveContainer } from 'recharts';

/**
 * KPICard Component
 * Reusable card component for displaying KPI metrics with sparkline chart
 * 
 * Props:
 *  - icon: Icon component to display
 *  - label: KPI label text
 *  - value: Main metric value to display
 *  - change: Change/comparison text (e.g., "+15.3%")
 *  - isPositive: Boolean to determine arrow direction color
 *  - period: Time period indicator (e.g., "This Month")
 *  - sparklineData: Array of data points for sparkline
 *  - bgColor: Tailwind class for icon background color
 *  - onClick: Callback function when card is clicked
 */
const KPICard = ({
  icon: Icon,
  label,
  value,
  change,
  isPositive,
  period,
  sparklineData,
  bgColor = 'bg-blue-500',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1"
    >
      {/* Header with Icon and Change Indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#bfa45b]/20 flex items-center justify-center text-[#bfa45b] flex-shrink-0 group-hover:bg-[#bfa45b] group-hover:text-[#1b1b1b] transition duration-200">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="text-xs font-semibold">{change}</span>
        </div>
      </div>

      {/* Metric Display Section */}
      <div className="mb-3">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-xs text-gray-500 mt-1">{period}</p>
      </div>

      {/* Mini Sparkline Chart */}
      <div className="h-10 mb-3 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <RechartLine 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? '#22c55e' : '#ef4444'} 
              dot={false} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Click Hint */}
      <div className="pt-3 border-t border-[#444] text-xs text-gray-400 group-hover:text-[#bfa45b] transition">
        Click for details →
      </div>
    </div>
  );
};

export default KPICard;
