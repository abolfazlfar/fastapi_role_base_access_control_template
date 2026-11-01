export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export const extractErrorMessage = (error: unknown): string => {
  if (error === null || error === undefined) {
    return "An unexpected error occurred.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  const err = error as ApiErrorResponse;
  if (err.detail) return err.detail;
  if (err.message) return err.message;

  return "An unexpected error occurred.";
};

export const isApiError = (error: unknown): error is ApiErrorResponse => {
  return (
    typeof error === "object" &&
    error !== null &&
    ("detail" in error || "message" in error)
  );
};
