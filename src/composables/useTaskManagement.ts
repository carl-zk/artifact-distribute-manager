import { computed, ref, type Ref } from "vue";
import type { Agent } from "@/types/Agent";
import type { FileEntry } from "@/types/FileEntity";
import type { Task } from "@/types/Task";
import { TaskStatus } from "@/types/Task";
import { createTasks as createTasksApi, startTasks as startTasksApi } from "@/services/clientApi";

export function useTaskManagement(selectedAgents: Ref<Agent[]>, selectedFiles: Ref<FileEntry[]>) {
    const tasks = ref<Task[]>([]);

    const createdTasksCount = computed(() =>
        tasks.value.filter((task) => task.status === TaskStatus.CREATED).length,
    );

    async function buildTaskRows(targetDirectory: string): Promise<Task[]> {
        const req = selectedAgents.value.flatMap((agent) =>
            selectedFiles.value.map((file) => ({
                agentId: agent.agentId,
                agentIp: agent.ip,
                fileId: file.id!,
                fileName: file.name,
                fileSize: file.size,
                status: TaskStatus.CREATED,
                saveToDir: targetDirectory,
            })),
        );

        return createTasksApi(req);
    }

    async function createTasks(targetDirectory: string) {
        tasks.value = await buildTaskRows(targetDirectory);
    }

    async function startTasks() {
        const taskIds = tasks.value
            .filter((task) => task.status === TaskStatus.CREATED && task.id != null)
            .map((task) => task.id!);

        if (!taskIds.length) return;

        await startTasksApi(taskIds);
    }

    return {
        tasks,
        createdTasksCount,
        createTasks,
        startTasks,
    };
}
