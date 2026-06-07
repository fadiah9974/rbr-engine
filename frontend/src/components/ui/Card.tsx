import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({
  action,
  className = '',
  description,
  title,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div className={`px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-start ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);
