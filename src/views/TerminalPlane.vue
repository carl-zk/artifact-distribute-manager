<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { useTerminalWorkspace } from '@/composables/useTerminalWorkspace'
import 'xterm/css/xterm.css'
import SelectAgents from '@/components/SelectAgents.vue'
import { type Agent } from '@/types/Agent'
import { fetchAgents } from '@/services/clientApi'

const workspace = useTerminalWorkspace()

const broadcastMode = ref(false)
const selectedTargets = ref<string[]>([])
const command = ref('')

// agent selection
const showAgents = ref(false)
const agents = ref<Agent[]>([])
const selectedAgents = ref<Agent[]>([])

const onSelectionChange = (selected: Agent[]) => {
  selectedAgents.value = selected
}

async function showAgentTable() {
  showAgents.value = true
  agents.value = await fetchAgents()
}

function openAgentTerminal() {
  showAgents.value = false
  selectedAgents.value.forEach(agent => workspace.addTerminal('AGENT', agent.agentId))
  selectedAgents.value = []
}

function sendBroadcast() {
  workspace.tabs.value.forEach(tab => {
    if (!selectedTargets.value.includes(tab.id)) return

    tab.terminal.send(`${command.value}\r`)
  })

  command.value = ''
}

function setTerminalEl(tabId: any, el: Element | ComponentPublicInstance | null) {
  if (!tabId || !el || !(el instanceof HTMLDivElement)) return

  const tab = workspace.getTab(tabId)

  if (!tab) return

  tab.el = el

  // delay ensures Vue finished patching + xterm safe mount
  requestAnimationFrame(() => {
    // ensure visible before open
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      // tabs with display = 'none'
      return
    }

    if (!tab.terminal.getSessionId()) {
      tab.terminal.open(el)
    }
    tab.terminal.resize()
  })
}

onMounted(() => {
  if (workspace.tabs.value.length) return
  workspace.addTerminal('SERVER')
})

onBeforeUnmount(() => {
  workspace.destroy()
})

watch(
  [broadcastMode, () => workspace.tabs.value.length],
  ([enabled]) => {
    selectedTargets.value = enabled ? workspace.tabs.value.map(t => t.id) : []
  },
  { immediate: true }
)
</script>

<template>
  <div class="terminal-workspace">
    <!-- TOP BAR -->
    <ul class="topbar">
      <li v-for="tab in workspace.tabs.value" :key="tab.id" class="tab-item">
        <button
          class="tab-button"
          :class="{ active: workspace.activeId.value === tab.id }"
          @click="workspace.activeId.value = tab.id"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <span class="tab-close" @click.stop="workspace.closeTab(tab.id)">×</span>
        </button>
      </li>

      <li class="tab-item">
        <button class="tab-button add-tab" @click="workspace.addTerminal('SERVER')">+</button>
      </li>

      <li class="topbar-spacer">
        <button class="pin-btn" @click="showAgentTable()">Agents</button>
      </li>
    </ul>

    <SelectAgents
      :visible="showAgents"
      :agents="agents"
      @close="openAgentTerminal()"
      @selectionChange="onSelectionChange"
    />

    <!-- TERMINAL AREA -->
    <div class="terminal-area">
      <div
        v-for="tab in workspace.tabs.value"
        :key="tab.id"
        class="terminal-pane"
        :style="{ display: workspace.activeId.value === tab.id ? 'block' : 'none' }"
      >
        <div class="terminal-host">
          <div :ref="el => setTerminalEl(tab.id, el)" class="terminal-node"></div>
        </div>
      </div>
    </div>

    <!-- BOTTOM BAR -->
    <div class="bottombar">
      <label class="checkbox-row">
        <input type="checkbox" v-model="broadcastMode" />
        <span>Broadcast mode</span>
      </label>

      <div v-if="broadcastMode" class="broadcast-panel">
        <div class="targets-title">Targets</div>
        <div class="targets">
          <label v-for="tab in workspace.tabs.value" :key="tab.id" class="checkbox-row">
            <input type="checkbox" :value="tab.id" v-model="selectedTargets" />
            <span>{{ tab.title }} | </span>
          </label>
        </div>

        <input
          class="command-input"
          v-model="command"
          placeholder="command..."
          @keydown.enter.prevent="command && sendBroadcast()"
        />

        <button class="send-btn" @click="sendBroadcast">Send</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ROOT ===== */
.terminal-workspace {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #111;
  color: #ddd;
}

/* ===== TOP BAR ===== */
.topbar {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  background: #1b1b1b;
  border-bottom: 1px solid #333;
}

.tab-item {
  display: flex;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
}

.tab-button:hover {
  background: #2a2a2a;
  color: #fff;
}

.tab-button.active {
  background: #333;
  color: #fff;
}

.tab-title {
  font-size: 13px;
}

.tab-close {
  margin-left: 6px;
  color: #ff5c5c;
  cursor: pointer;
}

.add-tab {
  font-weight: bold;
}

.topbar-spacer {
  margin-left: auto;
  margin-right: 8px;
}

.pin-btn {
  background: transparent;
  border: 1px solid #555;
  color: #ccc;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

/* ===== TERMINAL AREA ===== */
.terminal-area {
  flex: 1;
  background: #0f0f0f;
  overflow: hidden;
  position: relative;
}

.terminal-pane {
  height: 100%;
}

.terminal-host {
  height: 100%;
}

.terminal-node {
  height: 100%;
  width: 100%;
}

/* ===== BOTTOM BAR ===== */
.bottombar {
  border-top: 1px solid #333;
  padding: 10px;
  background: #1b1b1b;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px;
  cursor: pointer;
}

.broadcast-panel {
  margin-top: 8px;
}

.targets {
  margin-bottom: 8px;
  display: flex;
}

.targets-title {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.command-input {
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 8px;
  background: #111;
  border: 1px solid #444;
  color: #ddd;
  border-radius: 4px;
}

.send-btn {
  padding: 6px 10px;
  background: #2d6cdf;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.send-btn:hover {
  background: #1f5ad1;
}
</style>
