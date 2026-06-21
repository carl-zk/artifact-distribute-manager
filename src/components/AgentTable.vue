<script setup lang="ts">
import { useAgentTable } from "@/composables/useAgentTable";
import type { Agent } from "@/types/Agent";

const props = withDefaults(defineProps<{
  visible?: boolean;
  agents?: Agent[];
  selectable?: boolean;
}>(), {
  visible: true,
  agents: undefined,
  selectable: true,
});

const emit = defineEmits<{
  (e: "selectionChange", items: Agent[]): void;
}>();

const {
  loading,
  error,
  selectedIds,
  sortedAgents,
  toggle,
  setSort,
  sortIndicator,
} = useAgentTable(props, emit);
</script>

<template>
  <div>
    <div v-if="loading" class="text-center">Loading agents…</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <table v-else id="agent-table-1" class="table table-sm mb-0">
      <thead>
        <tr>
          <th><button type="button" class="sort-button" @click="setSort('namespace')">Namespace{{
            sortIndicator('namespace') }}</button></th>
          <th><button type="button" class="sort-button" @click="setSort('agentId')">ID{{ sortIndicator('agentId')
          }}</button></th>
          <th><button type="button" class="sort-button" @click="setSort('hostname')">Hostname{{
            sortIndicator('hostname') }}</button></th>
          <th><button type="button" class="sort-button" @click="setSort('ip')">IP{{ sortIndicator('ip') }}</button></th>
          <th><button type="button" class="sort-button" @click="setSort('os')">OS{{ sortIndicator('os') }}</button></th>
          <th><button type="button" class="sort-button" @click="setSort('arch')">Arch{{ sortIndicator('arch')
          }}</button></th>
          <th v-if="selectable" />
        </tr>
      </thead>
      <tbody>
        <tr v-if="!sortedAgents.length">
          <td :colspan="selectable ? 7 : 6" class="text-center">No agents selected.</td>
        </tr>
        <tr v-for="agent in sortedAgents" :key="agent.agentId"
          :class="{ 'table-active': selectable && selectedIds.includes(agent.agentId) }"
          @click="() => toggle(agent.agentId)">
          <td>{{ agent.namespace }}</td>
          <td>{{ agent.agentId }}</td>
          <td>{{ agent.hostname }}</td>
          <td>{{ agent.ip }}</td>
          <td>{{ agent.os }}</td>
          <td>{{ agent.arch }}</td>
          <td v-if="selectable">
            <input type="checkbox" class="form-check-input" :checked="selectedIds.includes(agent.agentId)"
              @change="(e) => (e.stopPropagation(), toggle(agent.agentId))" />
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

.sort-button {
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.sort-button:hover,
.sort-button:focus {
  text-decoration: underline;
}
</style>
