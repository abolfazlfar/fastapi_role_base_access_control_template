import React from "react";

interface LoadingProps {
  fullScreen?: boolean;
  className?: string;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  className,
  message = "Loading...",
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-3
        ${fullScreen ? "fixed inset-0 z-50 bg-slate-50/95 backdrop-blur-sm" : ""}
        ${className || ""}
      `}
    >
      <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-sm text-slate-600 font-medium">{message}</p>
    </div>
  );
};
