import type { Agent } from "@/types/Agent"
import type { FileEntry } from "@/types/FileEntity"
import type { Task } from "@/types/Task"

export type UploadResult = {
  ok: boolean
  status: number
  statusText: string
  body?: any
  error?: string
}

export async function uploadFiles(files: File[]): Promise<UploadResult> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file, file.name))

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
      body: text,
      error: `Upload failed: ${response.status} ${response.statusText} ${text}`,
    }
  }

  let body: any = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  return {
    ok: true,
    status: response.status,
    statusText: response.statusText,
    body,
  }
}

export async function fetchFiles(): Promise<FileEntry[]> {
  const response = await fetch('/api/files', {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()
  return json.map(toFileEntry)
}

function toFileEntry(data: any): FileEntry {
  return {
    id: Number(data.id),
    name: data.fileName,
    size: Number(data.fileSize),
    sha256: data.sha256,
  }
}

export async function fetchAgents(): Promise<Agent[]> {
  const response = await fetch('/api/admin/agents', {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`)
  }

  const agents: Agent[] = await response.json()
  return agents
}

export async function createTasks(tasks: Omit<Task, "id">[]): Promise<Task[]> {
  const response = await fetch('/api/admin/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tasks),
  })

  if (!response.ok) {
    throw new Error(`Failed to create tasks: ${response.status} ${response.statusText}`)
  }

  const createdTasks: Task[] = await response.json()
  return createdTasks
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('/api/admin/tasks', {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)
  }

  const tasks: Task[] = await response.json()
  return tasks
}

export async function startTasks(taskIds: number[]): Promise<void> {
  const response = await fetch('/api/admin/tasks/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskIds),
  })

  if (!response.ok) {
    throw new Error(`Failed to start tasks: ${response.status} ${response.statusText}`)
  }
}