import React from "react";

interface ExcelUploaderProps {
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  onUpload,
  className,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${isDragging ? "bg-brand-50 border-brand-500" : "bg-white border-slate-200 hover:bg-brand-50 hover:border-brand-500"} ${className || ""}`}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
    >
      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider">CSV, XLSX, XLS</p>
      </div>
    </div>
  );
};
