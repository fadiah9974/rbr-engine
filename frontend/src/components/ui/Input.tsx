import React from 'react';

const fieldClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { label: string; value: string | number }[];
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

function FieldFrame({
  children,
  className = '',
  error,
  helperText,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  helperText?: string;
  label?: string;
}) {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      {children}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const inputClasses = `${fieldClasses} ${error ? 'border-red-500 focus:ring-red-500' : ''}`;

  return (
    <FieldFrame className={className} error={error} helperText={helperText} label={label}>
      <input className={inputClasses} {...props} />
    </FieldFrame>
  );
};

export const Select: React.FC<SelectProps> = ({
  children,
  className = '',
  error,
  helperText,
  label,
  options,
  ...props
}) => {
  const selectClasses = `${fieldClasses} ${error ? 'border-red-500 focus:ring-red-500' : ''}`;

  return (
    <FieldFrame className={className} error={error} helperText={helperText} label={label}>
      <select className={selectClasses} {...props}>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
    </FieldFrame>
  );
};

export const Textarea: React.FC<TextareaProps> = ({
  className = '',
  error,
  helperText,
  label,
  ...props
}) => {
  const textareaClasses = `${fieldClasses} min-h-[100px] resize-y ${
    error ? 'border-red-500 focus:ring-red-500' : ''
  }`;

  return (
    <FieldFrame className={className} error={error} helperText={helperText} label={label}>
      <textarea className={textareaClasses} {...props} />
    </FieldFrame>
  );
};

export function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-semibold text-slate-700" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
