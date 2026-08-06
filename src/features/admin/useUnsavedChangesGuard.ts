import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useUnsavedChangesGuard(enabled: boolean) {
  const navigate = useNavigate();
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabled) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        !enabled
        || event.defaultPrevented
        || event.button !== 0
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
      ) return;

      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target.toLowerCase() !== "_self") return;

      const destinationUrl = new URL(link.href, window.location.href);
      if (destinationUrl.origin !== window.location.origin) return;

      const destination = `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (destination === currentLocation) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingDestination(destination);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [enabled]);

  const cancelNavigation = useCallback(() => setPendingDestination(null), []);
  const confirmNavigation = useCallback(() => {
    if (!pendingDestination) return;
    const destination = pendingDestination;
    setPendingDestination(null);
    navigate(destination);
  }, [navigate, pendingDestination]);

  return {
    isDialogOpen: pendingDestination !== null,
    cancelNavigation,
    confirmNavigation,
  };
}
