import { useNotifications } from "@toolpad/core";
import { useCallback } from "react";

const autoHideDuration = 2000;

export function useNotify(severity: "success" | "error") {
  const notifications = useNotifications();

  return useCallback((message: string) => {
    notifications.show(message, { autoHideDuration, severity });
  }, []);
}

export function useSuccess() {
  const notify = useNotify("success");
  return useCallback(() => {
    notify("Success");
  }, []);
}

export function useShowError() {
  return useNotify("error");
}
