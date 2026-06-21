<script setup lang="ts">
import { TaskStatus, type Task } from "@/types/Task";

const props = defineProps<{
  tasks: Task[];
}>();

function progressPercent(task: Task) {
  if (task.status === TaskStatus.SUCCESS) return 100;

  const fileSize = task.fileSize ?? 0;
  const transferred = task.transferedSize ?? 0;

  if (fileSize <= 0) return 0;

  const pct = Math.floor((transferred / fileSize) * 100);
  return Math.min(100, Math.max(0, pct));
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th scope="col">TaskId</th>
          <th scope="col">AgentId</th>
          <th scope="col">AgentName</th>
          <th scope="col">FileId</th>
          <th scope="col">FileName</th>
          <th scope="col">Path</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!tasks.length">
          <td colspan="7" class="text-center">No tasks created yet.</td>
        </tr>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.id }}</td>
          <td>{{ task.agentId }}</td>
          <td>{{ task.agentIp }}</td>
          <td>{{ task.fileId }}</td>
          <td>{{ task.fileName }}</td>
          <td>{{ task.saveToDir }}</td>
          <td>
            <div class="status-line">{{ task.status }}</div>

            <div v-if="task.status != 'CREATED'" class="mini-progress mt-1">
              <div class="progress" role="progressbar" :aria-valuenow="progressPercent(task)" aria-valuemin="0"
                aria-valuemax="100">
                <div class="progress-bar" :class="{
                  'bg-success': task.status === TaskStatus.SUCCESS,
                  'bg-info': task.status !== TaskStatus.SUCCESS,
                  'bg-secondary': task.status === TaskStatus.PENDING,
                  'bg-danger': task.status === TaskStatus.FAILED || task.status === TaskStatus.CANCELLED,
                }" :style="{ width: progressPercent(task) + '%' }">
                  {{ progressPercent(task) }}%
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Mini progress bar under the status cell */
.mini-progress .progress {
  height: 0.9rem;
  background-color: #e9ecef;
  border-radius: 0.45rem;
  overflow: hidden;
}

.mini-progress .progress-bar {
  font-size: 0.72rem;
  line-height: 0.9rem;
  padding: 0 0.35rem;
  white-space: nowrap;
}

.status-line {
  font-weight: 600;
  font-size: 0.95rem;
}

/* small spacing tweak */
td .mini-progress {
  max-width: 9rem;
}
</style>
