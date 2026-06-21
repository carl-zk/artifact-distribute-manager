<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "./views/Sidebar.vue";
import { useSse } from "@/composables/useSse";

const route = useRoute();
const { startSse, closeSse } = useSse();
const hasWindow = typeof window !== "undefined";

const hideSidebarOnLogin = computed(() => route.name === "Login");

onMounted(() => {
  if (!hasWindow) return;
  startSse();

  window.addEventListener("beforeunload", handleUnload);
});

onUnmounted(() => {
  if (!hasWindow) return;
  window.removeEventListener("beforeunload", handleUnload);
  closeSse();
});

function handleUnload() {
  try {
    closeSse();
  } catch {
    // ignore
  }
}

if (import.meta && (import.meta as any).hot) {
  ; (import.meta as any).hot.dispose(() => {
    try {
      closeSse();
    } catch {
      // ignore
    }
  });
}
</script>

<template>
  <div class="app-layout">
    <Sidebar v-if="!hideSidebarOnLogin" />

    <main class="main-content flex-fill p-4">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
}

.main-content {
  background: #f8f9fa;
  min-height: 100vh;
}
</style>
