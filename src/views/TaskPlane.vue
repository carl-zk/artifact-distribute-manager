<script setup lang="ts">
import { onMounted } from 'vue'
import AgentTable from '@/components/AgentTable.vue'
import CreateTasksControl from '@/components/CreateTasksControl.vue'
import FileTable from '@/components/FileTable.vue'
import SelectAgents from '@/components/SelectAgents.vue'
import TaskTable from '@/components/TaskTable.vue'
import { useTaskManagement } from '@/composables/useTaskManagement'
import { useTaskProgress } from '@/composables/useTaskProgress'
import { useTaskSelection } from '@/composables/useTaskSelection'
import { fetchTasks, fetchAgents } from '@/services/clientApi'

// Selection and modal state
const {
  activeModal,
  selectedAgents,
  selectedFiles,
  agents,
  openModal,
  closeModal,
  handleAgentSelection,
  handleFileSelection
} = useTaskSelection()

// Task management
const { tasks, createdTasksCount, createTasks, startTasks } = useTaskManagement(
  selectedAgents,
  selectedFiles
)

// Task progress tracking
useTaskProgress(tasks)

async function openAgentTable() {
  openModal('agents')
  agents.value = await fetchAgents()
}

function openFileTable() {
  openModal('files')
}

onMounted(async () => {
  tasks.value = await fetchTasks()
})
</script>

<template>
  <div class="task-plane">
    <!-- Selection actions -->
    <div class="selection-actions">
      <button type="button" class="btn btn-primary" @click="openAgentTable">Select Agents</button>
      <button type="button" class="btn btn-primary" @click="openFileTable">Select Files</button>
    </div>

    <!-- Current selections -->
    <div class="selections-container mb-4">
      <div class="selection-panel">
        <h5>Selected agents</h5>
        <AgentTable :agents="selectedAgents" :selectable="false" />
      </div>

      <div class="selection-panel">
        <h5>Selected files</h5>
        <FileTable :files="selectedFiles" :selectable="false" :show-sha="false" />
      </div>
    </div>

    <!-- Target directory and task creation -->
    <CreateTasksControl
      :selected-agents-count="selectedAgents.length"
      :selected-files-count="selectedFiles.length"
      :created-tasks-count="createdTasksCount"
      @create="createTasks"
      @start="startTasks"
    />

    <!-- Generated tasks -->
    <TaskTable :tasks="tasks" />

    <!-- Agent selection modal -->
    <SelectAgents
      :visible="activeModal === 'agents'"
      :agents="agents"
      @close="closeModal"
      @selectionChange="handleAgentSelection"
    />

    <!-- File selection modal -->
    <div v-if="activeModal === 'files'" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <h5 class="m-0">Select Files</h5>
          <button type="button" class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <FileTable :visible="activeModal === 'files'" @selectionChange="handleFileSelection" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Selection action buttons */
.selection-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.selection-actions .btn {
  min-width: 8.5rem;
}

/* Selection summary panels */
.selections-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.selection-panel {
  flex: 1;
  min-width: 300px;
}

/* Shared modal shell */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  padding: 0.5rem;
  position: relative;
  z-index: 1051;
  pointer-events: auto;
}

.modal-body {
  padding: 1rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  pointer-events: auto;
}
</style>
