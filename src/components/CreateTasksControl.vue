<script setup lang="ts">
import { computed, ref } from "vue";

const TARGET_DIRECTORY_HISTORY_KEY = "task-target-directory-history";
const MAX_DIRECTORY_HISTORY = 10;
const DISABLED_MESSAGE = "please choose agents & files & target directory of agents";

const props = defineProps<{
  selectedAgentsCount: number;
  selectedFilesCount: number;
  createdTasksCount: number;
}>();

const emit = defineEmits<{
  (e: "create", targetDirectory: string): void;
  (e: "start"): void;
}>();

const targetDirectory = ref("");
const dirHistories = ref<string[]>([]);
const showConfirmModal = ref(false);

const hasSelectedAgents = computed(() => props.selectedAgentsCount > 0);
const hasSelectedFiles = computed(() => props.selectedFilesCount > 0);
const hasTargetDirectory = computed(() => targetDirectory.value.trim().length > 0);
const hasCreatedTasks = computed(() => props.createdTasksCount > 0);
const isCreateDisabled = computed(
  () => !hasSelectedAgents.value || !hasSelectedFiles.value || !hasTargetDirectory.value,
);
const isStartDisabled = computed(() => !hasCreatedTasks.value);
const createTooltip = computed(() => (isCreateDisabled.value ? DISABLED_MESSAGE : null));

function loadDirHistories() {
  if (typeof window === "undefined") return;

  try {
    const stored = window.localStorage.getItem(TARGET_DIRECTORY_HISTORY_KEY);
    if (stored) dirHistories.value = JSON.parse(stored) as string[];
  } catch {
    dirHistories.value = [];
  }
}

function saveDirHistory(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;

  dirHistories.value = [trimmed, ...dirHistories.value.filter((item) => item !== trimmed)].slice(
    0,
    MAX_DIRECTORY_HISTORY,
  );

  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(TARGET_DIRECTORY_HISTORY_KEY, JSON.stringify(dirHistories.value));
  } catch {
    // ignore localStorage failures
  }
}

function createTasks() {
  if (isCreateDisabled.value) return;

  const trimmedDirectory = targetDirectory.value.trim();
  saveDirHistory(trimmedDirectory);
  emit("create", trimmedDirectory);
}

function requestStartTasks() {
  showConfirmModal.value = true;
}

function cancelStartTasks() {
  showConfirmModal.value = false;
}

function confirmStartTasks() {
  showConfirmModal.value = false;
  emit("start");
}

loadDirHistories();
</script>

<template>
  <div class="mb-3 d-flex gap-2 align-items-end flex-wrap task-target-row">
    <div class="flex-grow-1 target-input-wrapper">
      <input id="targetDirectory" type="text" class="form-control" placeholder="Input target directory"
        v-model="targetDirectory" list="dirHistoryOptions" />
      <datalist id="dirHistoryOptions">
        <option v-for="dir in dirHistories" :key="dir" :value="dir" />
      </datalist>
    </div>

    <span class="create-tasks-wrapper mt-3" :class="{ 'is-disabled': isCreateDisabled }" :data-tooltip="createTooltip">
      <button type="button" class="btn btn-outline-primary" :disabled="isCreateDisabled" @click="createTasks">
        Create tasks
      </button>
      <button type="button" class="btn btn-primary ms-2" :disabled="isStartDisabled" @click="requestStartTasks">
        Start tasks
      </button>
    </span>
  </div>

  <div v-if="showConfirmModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Start</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="cancelStartTasks"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to start tasks?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelStartTasks">Cancel</button>
          <button type="button" class="btn btn-primary" @click="confirmStartTasks">Start tasks</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Target directory row */
.task-target-row .target-input-wrapper {
  max-width: 50%;
  width: 100%;
}

/* Tooltip for the disabled create button. */
.create-tasks-wrapper {
  position: relative;
  display: inline-flex;
}

.create-tasks-wrapper .btn:disabled {
  color: #6c757d;
  background-color: #e9ecef;
  border-color: #ced4da;
  opacity: 1;
}

.create-tasks-wrapper.is-disabled:hover::after {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.5rem);
  z-index: 10;
  width: max-content;
  max-width: 20rem;
  padding: 0.35rem 0.55rem;
  color: #fff;
  font-size: 0.875rem;
  line-height: 1.3;
  text-align: center;
  white-space: normal;
  background: rgba(33, 37, 41, 0.95);
  border-radius: 0.25rem;
  content: attr(data-tooltip);
  transform: translateX(-50%);
}

.create-tasks-wrapper.is-disabled:hover::before {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.2rem);
  z-index: 10;
  border: 0.3rem solid transparent;
  border-top-color: rgba(33, 37, 41, 0.95);
  content: "";
  transform: translateX(-50%);
}
</style>
