import type { NavigateFunction } from "react-router-dom";

let navigatorRef: NavigateFunction | null = null;

export function setNavigator(navigate: NavigateFunction) {
    navigatorRef = navigate;
}

export function navigateFromAnywhere(path: string) {
    if (navigatorRef) {
        navigatorRef(path);
    } else {
        window.location.assign(path); // fallback
    }
}
