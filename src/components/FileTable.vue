<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FileEntry } from "@/types/FileEntity";
import { fetchFiles } from "@/services/clientApi";
import { formatSize } from "@/tools/index";

const props = withDefaults(defineProps<{
  visible?: boolean;
  files?: FileEntry[];
  selectable?: boolean;
  showSha?: boolean;
}>(), {
  visible: true,
  files: undefined,
  selectable: true,
  showSha: true,
});

const emit = defineEmits<{
  (e: "selectionChange", items: FileEntry[]): void;
}>();

const loadedFiles = ref<FileEntry[]>([]);
const selectedIds = ref<number[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const displayedFiles = computed(() => props.files ?? loadedFiles.value);

async function loadFiles() {
  if (props.files) return;

  loading.value = true;
  error.value = null;
  loadedFiles.value = [];
  selectedIds.value = [];
  try {
    const list = await fetchFiles();
    loadedFiles.value = list;
  } catch (err: any) {
    console.error("FileTable: failed to fetch files", err);
    error.value = err?.message ?? String(err);
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.visible,
  (v) => {
    if (v) loadFiles();
  },
  { immediate: true }
);

function emitSelection() {
  emit(
    "selectionChange",
    displayedFiles.value.filter((file) => selectedIds.value.includes(file.id!))
  );
}

function toggle(id: number) {
  if (!props.selectable) return;

  const i = selectedIds.value.indexOf(id);
  if (i === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(i, 1);
  emitSelection();
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-center">Loading files…</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <table v-else id="file-table" class="table table-sm mb-0">
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Size</th>
          <th v-if="showSha">SHA256</th>
          <th v-if="selectable" />
        </tr>
      </thead>
      <tbody>
        <tr v-if="!displayedFiles.length">
          <td :colspan="3 + Number(showSha) + Number(selectable)" class="text-center">No files selected.</td>
        </tr>
        <tr
          v-for="file in displayedFiles"
          :key="file.id"
          :class="{ 'table-active': selectable && selectedIds.includes(file.id!) }"
          @click="() => toggle(file.id!)"
        >
          <td>{{ file.id }}</td>
          <td>{{ file.name }}</td>
          <td>{{ formatSize(file.size) }}</td>
          <td v-if="showSha"><code>{{ file.sha256?.substring(0, 16) }}...</code></td>
          <td v-if="selectable">
            <input
              type="checkbox"
              class="form-check-input"
              :checked="selectedIds.includes(file.id!)"
              @change="(e) => (e.stopPropagation(), toggle(file.id!))"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-active {
  background-color: #f8f9fa;
}
</style>
