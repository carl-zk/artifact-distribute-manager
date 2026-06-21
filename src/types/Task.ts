export enum TaskStatus {
    CREATED = "CREATED",
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    UNKNOWN = "UNKNOWN",
}

export type Task = {
    id?: number,
    agentId: string,
    agentIp?: string,
    fileId: number,
    fileName?: string,
    fileSize?: number,
    saveToDir: string,
    status: TaskStatus,
    transferedSize?: number,
}

export type TaskProgressEvent = {
    taskId: number,
    transferredSize: number,
    status: TaskStatus,
}