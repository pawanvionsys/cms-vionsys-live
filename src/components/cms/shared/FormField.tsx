import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({
  label,
  error,
  description,
  children,
  required = false
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {description && !error && (
        <span className="text-xs text-slate-400">{description}</span>
      )}
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}
