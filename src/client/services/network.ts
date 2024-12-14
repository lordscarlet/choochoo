import { useNotifications } from "@toolpad/core";
import { isFetchError } from "@ts-rest/react-query/v5";
import { useCallback, useEffect } from "react";
import { ValidationError, ZodErrorResponse } from "../../api/error";
import { ZodError } from "zod";

interface NetworkError {
  status: number;
  body: unknown;
}

interface ErrorBody {
  error: string;
  code?: number;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error != null && typeof error === 'object' && 'status' in error && typeof error.status === 'number' &&
    'body' in error;
}

export function isErrorBody(t: unknown): t is ErrorBody {
  return t != null && typeof t === 'object' && 'error' in t;
}

export function useErrorNotifier(): (error: Error | NetworkError) => void {
  const notifications = useNotifications();
  return useCallback((error: Error | NetworkError) => notifications.show(toMessage(error), {
    severity: 'error',
    autoHideDuration: 2000,
  }), [notifications]);
}

export function toValidationError(error: ZodError): ValidationError {
  return Object.fromEntries(error.issues.map((issue) => {
    return [issue.path[0], issue.message];
  }));
}

export function handleError(isPending: boolean, error?: Error | NetworkError | null): ValidationError | undefined {
  const notify = useErrorNotifier();
  useEffect(() => {
    if (error == null || isPending) return;
    notify(error);
  }, [error]);

  if (isPending || error == null || isFetchError(error)) {
    return undefined;
  }

  const zodError = ZodErrorResponse.safeParse(error.body);
  if (zodError.success) {
    return toValidationError(new ZodError(zodError.data.issues));
  }
  return undefined;
}

function toMessage(error: Error | NetworkError): string {
  if (isFetchError(error) || error.status >= 500) {
    console.error(error);
    return 'An unknown error occurred';
  }
  const prefix = toPrefix(error.status);
  if (prefix != null) {
    if (isErrorBody(error.body)) {
      return `${prefix}: ${error.body.error}`;
    }
    return prefix;
  }
  console.error(error);
  return 'An unknown error occurred';
}

function toPrefix(status: number): string | undefined {
  switch (status) {
    case 400: return 'Invalid request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not found';
    default:
      return undefined;
  }
}