import { useCallback, useEffect, useState } from "react";

export type AppRoute =
  | { kind: "home" }
  | { kind: "tutorial" }
  | { kind: "room"; code: string; legacy: boolean }
  | { kind: "notFound" };

const ROOM_CODE = /^[A-Z0-9]{4}$/;
export const APP_ORIGIN = "https://app.lasana.polgubau.com";

export function isRoomCode(code: string): boolean {
  return ROOM_CODE.test(code);
}

export function roomPath(code: string): string {
  return `/sala/${code.toUpperCase()}`;
}

export function roomUrl(code: string): string {
  return new URL(roomPath(code), APP_ORIGIN).toString();
}

export function routeFromLocation(pathname: string, search: string): AppRoute {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const room = normalizedPath.match(/^\/sala\/([A-Z0-9]{4})$/i);
  if (room) return { kind: "room", code: room[1]!.toUpperCase(), legacy: false };
  if (normalizedPath === "/tutorial") return { kind: "tutorial" };
  if (normalizedPath !== "/") return { kind: "notFound" };

  const legacyCode = new URLSearchParams(search).get("sala")?.trim().toUpperCase();
  if (legacyCode && isRoomCode(legacyCode)) return { kind: "room", code: legacyCode, legacy: true };
  return { kind: "home" };
}

export function useAppRouter(): [AppRoute, (path: string, replace?: boolean) => void] {
  const [route, setRoute] = useState(() =>
    routeFromLocation(window.location.pathname, window.location.search),
  );

  useEffect(() => {
    const updateRoute = () =>
      setRoute(routeFromLocation(window.location.pathname, window.location.search));
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  const navigate = useCallback((path: string, replace = false): void => {
    window.history[replace ? "replaceState" : "pushState"](null, "", path);
    setRoute(routeFromLocation(window.location.pathname, window.location.search));
  }, []);

  return [route, navigate];
}
