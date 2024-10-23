import { useNotifications } from "@toolpad/core";
import { isFetchError } from "@ts-rest/react-query/v5";
import { useEffect } from "react";
import { ValidationError } from "../../api/error";

interface NetworkError {
  status: number;
  body: unknown;
}

export function handleError(isPending: boolean, error?: Error | NetworkError | null): ValidationError | undefined {
  const notifications = useNotifications();
  useEffect(() => {
    if (error == null || isPending) return;
    notifications.show(toMessage(error), {
      severity: 'error',
    });
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
    return 'Invalid credentials';
  }
  if (error.status === 400) {
    return 'Invalid request';
  }
  console.error(error);
  return 'An unknown error occurred';
}