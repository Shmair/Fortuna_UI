import { useCallback } from "react";

export function useToast() {
  // Simple toast mock for development
  const toast = useCallback(({ title, description, variant }) => {
    window.alert(`${title}\n${description || ""}`);
  }, []);
  return { toast };
}
