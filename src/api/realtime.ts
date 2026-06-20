import { Client } from "@stomp/stompjs";

let client: Client | null = null;

type SubscriptionCallback<T> = (payload: T) => void;

export function getRealtimeClient(): Client {
    if (client) return client;

    const wsUrl =
        (import.meta as any).env?.VITE_WS_URL ||
        "ws://localhost:8085/ws";

    client = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => {},
    });

    client.activate();

    return client;
}

export function subscribeTopic<T>(
    topic: string,
    callback: SubscriptionCallback<T>
): () => void {
    const stompClient = getRealtimeClient();

    let subscription: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    const subscribe = () => {
        if (cancelled || !stompClient.connected) return;

        subscription = stompClient.subscribe(topic, (frame) => {
            if (!frame.body) return;

            try {
                callback(JSON.parse(frame.body) as T);
            } catch (error) {
                console.error("Failed to parse realtime message", error);
            }
        });
    };

    if (stompClient.connected) {
        subscribe();
    } else {
        const previousOnConnect = stompClient.onConnect;
        stompClient.onConnect = (frame) => {
            previousOnConnect?.(frame);
            subscribe();
        };
    }

    return () => {
        cancelled = true;
        subscription?.unsubscribe();
    };
}