import { useEffect } from "react";

const SITE = "Hope Rising Education";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} — Empowering Children Through Education`;
    return () => {
      document.title = `${SITE} — Empowering Children Through Education`;
    };
  }, [title]);
}
