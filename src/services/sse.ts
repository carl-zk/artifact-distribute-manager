import type { TaskProgressEvent } from "@/types/Task";

const SSE_URL = "/api/admin/events";

const progressListeners = new Set<(payload: TaskProgressEvent) => void>();
const heartbeatListeners = new Set<(data: string) => void>();
const openListeners = new Set<() => void>();
const errorListeners = new Set<(error: Event | string) => void>();

let eventSource: EventSource | null = null;

export function startSse(): void {
    if (eventSource) {
        return;
    }

    eventSource = new EventSource(SSE_URL);

    if (import.meta.hot) {
        import.meta.hot.dispose(() => {
            eventSource?.close();
            eventSource = null;
        });
    }

    eventSource.onopen = () => {
        openListeners.forEach((listener) => listener());
    };

    eventSource.addEventListener("heartbeat", (event: Event) => {
        const data = (event as MessageEvent).data;
        heartbeatListeners.forEach((listener) => listener(data));
    });

    eventSource.addEventListener("progress", (event: Event) => {
        try {
            const payload = JSON.parse((event as MessageEvent).data) as TaskProgressEvent;
            console.debug("Received progress event", payload);
            progressListeners.forEach((listener) => listener(payload));
        } catch (error) {
            console.error("Failed to parse progress event", error);
            errorListeners.forEach((listener) => listener(error as Event | string));
        }
    });

    eventSource.onerror = (error) => {
        errorListeners.forEach((listener) => listener(error));

        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
            closeSse();
        }
    };
}

export function closeSse(): void {
    if (!eventSource) {
        return;
    }

    eventSource.close();
    eventSource = null;
}

export function onProgress(listener: (payload: TaskProgressEvent) => void): () => void {
    progressListeners.add(listener);
    return () => progressListeners.delete(listener);
}

export function onHeartbeat(listener: (data: string) => void): () => void {
    heartbeatListeners.add(listener);
    return () => heartbeatListeners.delete(listener);
}

export function onOpen(listener: () => void): () => void {
    openListeners.add(listener);
    return () => openListeners.delete(listener);
}

export function onError(listener: (error: Event | string) => void): () => void {
    errorListeners.add(listener);
    return () => errorListeners.delete(listener);
}
