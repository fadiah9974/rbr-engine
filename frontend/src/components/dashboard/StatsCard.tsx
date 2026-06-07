import React from 'react';
import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, description }) => {
  return (
    <Card className="p-6 transition-all duration-200 hover:shadow-md hover:border-teal-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
          
          {(trend || description) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span className={`inline-flex items-center text-xs font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}%
                </span>
              )}
              {description && <span className="text-xs text-slate-500">{description}</span>}
            </div>
          )}
        </div>
        <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};
