import { Client } from "@stomp/stompjs";
import { clearAuth } from "./api";
import { getCurrentAdminUser } from "./auth";
import { navigateFromAnywhere } from "./navigationbridge";

let client: Client | null = null;

function setPendingPasswordReset(email?: string) {
    localStorage.setItem("pendingPasswordReset", "true");
    sessionStorage.setItem("pendingPasswordReset", "true");
    if (email) {
        localStorage.setItem("pendingPasswordResetEmail", email);
        sessionStorage.setItem("pendingPasswordResetEmail", email);
    }
}

export function startForceLogoutRealtime() {
    const me = getCurrentAdminUser();
    if (!me?.email) return;
    if (client?.active) return;

    const wsUrl = (import.meta as any).env?.VITE_WS_URL || "ws://localhost:8085/ws";
    const topic = `/topic/force-logout/${me.email}`;

    client = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => {}
    });

    client.onConnect = () => {
        client?.subscribe(topic, (frame) => {
            let payload: { type?: string; email?: string } = {};
            try {
                payload = frame.body ? JSON.parse(frame.body) : {};
            } catch { /* empty */ }

            if (payload.type === "PASSWORD_RESET_REQUIRED") {
                const email = payload.email || me.email;
                setPendingPasswordReset(email);
                clearAuth();
                navigateFromAnywhere(`/change-password-required?email=${encodeURIComponent(email)}`);
                return;
            }

            clearAuth();
            navigateFromAnywhere("/");
        });
    };

    client.activate();
}

export async function stopForceLogoutRealtime() {
    if (client) {
        await client.deactivate();
        client = null;
    }
}
