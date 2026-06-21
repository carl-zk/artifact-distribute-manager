import { onMounted, onUnmounted, type Ref } from "vue";
import type { Task, TaskProgressEvent } from "@/types/Task";
import { TaskStatus } from "@/types/Task";
import { useSse } from "@/composables/useSse";

const { onProgress, onHeartbeat, onError, onOpen } = useSse();

export function useTaskProgress(tasks: Ref<Task[]>) {
    let removeProgressListener: (() => void) | null = null;
    let removeHeartbeatListener: (() => void) | null = null;
    let removeOpenListener: (() => void) | null = null;
    let removeErrorListener: (() => void) | null = null;

    function updateTaskFromProgress(payload: TaskProgressEvent) {
        const task = tasks.value.find((item) => item.id === payload.taskId);
        if (!task) return;

        if (payload.status === TaskStatus.SUCCESS) {
            task.status = TaskStatus.SUCCESS;
        } else if (payload.status === TaskStatus.RUNNING) {
            task.status = TaskStatus.RUNNING;
            task.transferedSize = payload.transferredSize!;
        }

        console.log(`Task ${task.id} progress: ${payload.transferredSize}/${task.fileSize} bytes`);
    }

    function registerListeners() {
        removeProgressListener = onProgress((payload) => {
            updateTaskFromProgress(payload);
        });

        removeHeartbeatListener = onHeartbeat((data) => {
            console.log("Heartbeat received from server", data);
        });

        removeOpenListener = onOpen(() => {
            console.log("Task events stream opened");
        });

        removeErrorListener = onError((error) => {
            console.warn("SSE connection error", error);
        });
    }

    function unregisterListeners() {
        removeProgressListener?.();
        removeHeartbeatListener?.();
        removeOpenListener?.();
        removeErrorListener?.();

        removeProgressListener = null;
        removeHeartbeatListener = null;
        removeOpenListener = null;
        removeErrorListener = null;
    }

    onMounted(() => {
        registerListeners();
    });

    onUnmounted(() => {
        unregisterListeners();
    });

    return {
        updateTaskFromProgress,
    };
}
