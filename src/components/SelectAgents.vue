<script setup lang="ts">
import AgentTable from "@/components/AgentTable.vue";
import type { Agent } from "@/types/Agent";
import { useAgentGroupFilter } from "@/composables/useAgentGroupFilter";
import { ref, toRef } from "vue";

const props = defineProps<{
  visible: boolean;
  agents?: Agent[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "selectionChange", items: Agent[]): void;
}>();

const searchTerm = ref("");
const { filteredAgentGroups } = useAgentGroupFilter(toRef(props, "agents"), searchTerm);

const sanitizeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]+/g, "-");


function closeModal() {
  emit("close");
}

function handleSelection(items: Agent[]) {
  emit("selectionChange", items);
}
</script>

<template>
  <div v-if="visible" id="agents" class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-header d-flex justify-content-between align-items-center">
        <h5 class="m-0">Agents</h5>
        <button type="button" class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <input type="search" class="form-control" placeholder="Search by Namespace, agent ID, hostname, or IP"
            v-model="searchTerm" />
        </div>
        <div v-if="!filteredAgentGroups.length" class="text-muted mb-3">No agents match your search.</div>
        <div v-for="{ env, agents } in filteredAgentGroups" :key="env" class="accordion"
          :id="`agentGroups-${sanitizeId(env)}`">
          <div class="accordion-item">
            <h2 class="accordion-header" :id="`${sanitizeId(env)}Heading`">
              <button class="accordion-button" type="button" data-bs-toggle="collapse"
                :data-bs-target="`#agentCluster-${sanitizeId(env)}`" aria-expanded="true"
                :aria-controls="`agentCluster-${sanitizeId(env)}`">
                {{ env }}
              </button>
            </h2>
            <div :id="`agentCluster-${sanitizeId(env)}`" class="accordion-collapse collapse show"
              :aria-labelledby="`${sanitizeId(env)}Heading`">
              <div class="accordion-body">
                <AgentTable :visible="visible" :agents="agents" @selectionChange="handleSelection" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Agent selection modal shell */
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
