import { useCallback } from "react";
import { toast } from "react-toastify";

export function useSuccess() {
  return useCallback(() => {
    toast.success("Success");
  }, []);
}
