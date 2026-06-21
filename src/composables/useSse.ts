import { ref } from "vue";
import type { TaskProgressEvent } from "@/types/Task";
import {
    startSse as serviceStartSse,
    closeSse as serviceCloseSse,
    onProgress as serviceOnProgress,
    onHeartbeat as serviceOnHeartbeat,
    onOpen as serviceOnOpen,
    onError as serviceOnError,
} from "@/services/sse";

const isStarted = ref(false);
const isConnected = ref(false);
const lastError = ref<Event | string | null>(null);

function startSse() {
    if (isStarted.value) return;

    serviceStartSse();
    isStarted.value = true;
}

function closeSse() {
    if (!isStarted.value) return;

    serviceCloseSse();
    isStarted.value = false;
    isConnected.value = false;
}

function onProgress(listener: (payload: TaskProgressEvent) => void) {
    return serviceOnProgress(listener);
}

function onHeartbeat(listener: (data: string) => void) {
    return serviceOnHeartbeat(listener);
}

function onOpen(listener: () => void) {
    return serviceOnOpen(() => {
        isConnected.value = true;
        listener();
    });
}

function onError(listener: (error: Event | string) => void) {
    return serviceOnError((error) => {
        lastError.value = error;
        listener(error);
    });
}

export function useSse() {
    return {
        isStarted,
        isConnected,
        lastError,
        startSse,
        closeSse,
        onProgress,
        onHeartbeat,
        onOpen,
        onError,
    };
}
