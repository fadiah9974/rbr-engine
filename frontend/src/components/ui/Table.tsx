import React from 'react';

export const Table = ({
  children,
  className = '',
  headers,
}: {
  children: React.ReactNode;
  className?: string;
  headers?: string[];
}) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table className="w-full min-w-[640px] text-sm text-left text-slate-600">
      {headers && (
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-4 font-semibold tracking-wider" key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-slate-100">
        {children}
      </tbody>
    </table>
  </div>
);

export const Thead = ({ children }: { children: React.ReactNode }) => (
  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
    {children}
  </thead>
);

export const Tbody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-slate-100">
    {children}
  </tbody>
);

export const Tr = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <tr className={`hover:bg-slate-50/50 transition-colors ${className}`}>
    {children}
  </tr>
);

export const Th = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <th scope="col" className={`px-4 py-4 font-semibold tracking-wider ${className}`}>
    {children}
  </th>
);

export const Td = ({
  children,
  className = '',
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-4 py-4 whitespace-nowrap ${className}`} {...props}>
    {children}
  </td>
);
