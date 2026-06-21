<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { uploadFiles } from "@/services/clientApi";
import type { FileEntry } from "@/types/FileEntity";
import { formatSize } from "@/tools/index";

const files = ref<FileEntry[]>([]);
const uploading = ref(false);
const uploadMessage = ref<string | null>(null);
const uploadError = ref(false);

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const list = input.files;
  //files.value.forEach((f) => f.url && URL.revokeObjectURL(f.url));
  //files.value = [];
  uploadMessage.value = null;

  if (!list) return;

  for (let i = 0; i < list.length; i++) {
    const f = list[i]!;
    const entry: FileEntry = {
      name: f.name,
      type: f.type || "unknown",
      size: f.size,
      status: "Ready",
      url: URL.createObjectURL(f),
      // try several sources for a filesystem path when available:
      // - Electron renderer `File.path`
      // - directory uploads: `webkitRelativePath` (when input has `webkitdirectory`)
      // otherwise leave empty (browsers don't expose full system paths)
      path: (f as any).path || (f as any).webkitRelativePath || "",
      file: f,
    };
    files.value.push(entry);
  }
}

async function uploadAll() {
  if (!files.value.length) {
    uploadMessage.value = "No files selected to upload.";
    uploadError.value = false;
    return;
  }

  uploading.value = true;
  uploadError.value = false;
  uploadMessage.value = null;
  files.value.forEach((f) => (f.status = "Uploading"));

  const result = await uploadFiles(files.value.map((entry) => entry.file!));

  if (result.ok) {
    files.value.forEach((f) => (f.status = "Uploaded"));
    uploadMessage.value = "Files uploaded successfully.";
  } else {
    files.value.forEach((f) => (f.status = "Error"));
    uploadError.value = true;
    uploadMessage.value = result.error || "Upload failed.";
  }

  uploading.value = false;
}

function removeFile(idx: number) {
  const f = files.value[idx];
  console.log("Removing file:", f);
  if (f && f.url) URL.revokeObjectURL(f.url);
  files.value.splice(idx, 1);
}

onBeforeUnmount(() => {
  files.value.forEach((f) => f.url && URL.revokeObjectURL(f.url));
});
</script>

<template>
  <h1 class="text-primary border-1">Upload files to server</h1>
  <div class="files-plane">
    <div class="input-group mb-3">
      <input
        type="file"
        class="form-control"
        id="inputGroupFile02"
        @change="onFileChange"
        multiple
      />
      <button
        type="button"
        class="btn btn-primary"
        :disabled="uploading || !files.length"
        @click="uploadAll"
      >
        {{ uploading ? "Uploading..." : "Upload All" }}
      </button>
    </div>

    <div v-if="uploadMessage" class="mb-3">
      <div
        class="alert"
        :class="uploading ? 'alert-info' : uploadError ? 'alert-danger' : 'alert-success'"
      >
        {{ uploadMessage }}
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Size</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!files.length" v-for="n in 2" :key="`empty-${n}`">
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr v-for="(f, idx) in files" :key="idx">
            <td>{{ f.name }} <small v-if="f.path"> — path available</small></td>
            <td>{{ f.type }}</td>
            <td>{{ formatSize(f.size) }}</td>
            <td>{{ f.status }}</td>
            <td class="d-flex gap-2">
              <a
                v-if="f.url"
                :href="f.url"
                target="_blank"
                rel="noopener"
                class="btn btn-sm btn-primary"
                >Open</a
              >
              <button v-else type="button" class="btn btn-sm btn-secondary">N/A</button>
              <button
                type="button"
                class="btn btn-sm btn-danger"
                @click="removeFile(idx)"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.files-plane {
  width: 100%;
  max-width: 100%;
}

.files-plane .input-group {
  max-width: 30%;
}

.files-plane input.form-control {
  min-width: 0;
}
</style>
