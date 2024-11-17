import { useNotifications } from "@toolpad/core";
import { isFetchError } from "@ts-rest/react-query/v5";
import { useCallback, useEffect } from "react";
import { ValidationError } from "../../api/error";

interface NetworkError {
  status: number;
  body: unknown;
}

interface ErrorBody {
  error: string;
}

function isErrorBody(t: unknown): t is ErrorBody {
  return t != null && typeof t === 'object' && 'error' in t;
}

export function useErrorNotifier(): (error: Error | NetworkError) => void {
  const notifications = useNotifications();
  return useCallback((error: Error | NetworkError) => notifications.show(toMessage(error), {
    severity: 'error',
    autoHideDuration: 2000,
  }), [notifications]);
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

  const validationError = ValidationError.safeParse(error.body);
  if (validationError.success) {
    return validationError.data;
  }
  return undefined;
}

function toMessage(error: Error | NetworkError): string {
  if (isFetchError(error) || error.status >= 500) {
    console.error(error);
    return 'An unknown error occurred';
  }
  if (error.status === 403) {
    return 'You are not authorized to perform that operation';
  }
  if (error.status === 401) {
    if (isErrorBody(error.body)) {
      return `Unauthorized: ${error.body.error}`;
    }
    return 'Unauthorized: ';
  }
  if (error.status === 400) {
    if (isErrorBody(error.body)) {
      return `Invalid request: ${error.body.error}`;
    }
    return 'Invalid request';
  }
  console.error(error);
  return 'An unknown error occurred';
}