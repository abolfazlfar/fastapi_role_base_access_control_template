export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const exportToCsv = (data: Record<string, unknown>[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const cell = row[h];
          const stringified = cell !== null && cell !== undefined ? String(cell) : "";
          return stringified.includes(",") || stringified.includes('"')
            ? `"${stringified.replace(/"/g, '""')}"`
            : stringified;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvRows], { type: "text/csv" });
  downloadFile(blob, filename);
};
