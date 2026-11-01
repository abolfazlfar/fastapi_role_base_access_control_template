import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`block w-full pl-10 pr-3.5 py-3 text-sm text-slate-900 bg-white border rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 outline-none placeholder:text-slate-400 ${
              error ? "border-red-500 focus:ring-red-500/20" : "border-slate-200"
            } ${className || ""}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
              !
            </span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
