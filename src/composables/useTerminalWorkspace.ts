import { computed, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { useTerminal } from './useTerminal'
import type { Agent } from '@/types/Agent'
import { fetchAgents } from '@/services/clientApi'

export interface TerminalTab {
  id: string
  title: string
  el?: HTMLDivElement | null
  terminal: {
    open: (el: HTMLDivElement) => Promise<void>
    resize: () => void
    destroy: () => void
    getSessionId: () => string | null
    send: (msg: string) => void
  }
}

export type TargetType = 'SERVER' | 'AGENT'

export function useTerminalWorkspace() {
  // tab
  const tabs = ref<TerminalTab[]>([])
  const activeId = ref<string | null>(null)
  const activeTab = computed(() => tabs.value.find(t => t.id === activeId.value))
  let nextTabNo = 0

  async function addTerminal(targetType: TargetType, agentId?: string) {
    const terminal = useTerminal(targetType, agentId)
    const id = crypto.randomUUID()

    let titlePrefix = agentId === undefined ? 'Server-' : `Agent-${agentId}-`

    const tab: TerminalTab = {
      id,
      title: `${titlePrefix}-${++nextTabNo}`,
      terminal
    }

    tabs.value.push(tab)
    activeId.value = id
    return tab
  }

  function closeTab(id: string) {
    const index = tabs.value.findIndex(t => t.id === id)

    tabs.value[index]!.terminal.destroy()
    tabs.value.splice(index, 1)

    if (activeId.value === id) {
      activeId.value = tabs.value[Math.min(index, tabs.value.length - 1)]?.id ?? null
    }
  }

  function getTab(id: string): TerminalTab | undefined {
    return tabs.value.find(t => t.id === id)
  }

  function destroy() {
    tabs.value.forEach(tab => tab.terminal.destroy())
  }

  // terminal
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
    selectedAgents.value.forEach(agent => addTerminal('AGENT', agent.agentId))
    selectedAgents.value = []
  }

  function sendBroadcast() {
    tabs.value.forEach(tab => {
      if (!selectedTargets.value.includes(tab.id)) return

      tab.terminal.send(`${command.value}\r`)
    })

    command.value = ''
  }

  function setTerminalEl(tabId: any, el: Element | ComponentPublicInstance | null) {
    if (!tabId || !el || !(el instanceof HTMLDivElement)) return

    const tab = getTab(tabId)

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
    if (tabs.value.length) return
    addTerminal('SERVER')
  })

  onBeforeUnmount(() => {
    destroy()
  })

  watch(
    [broadcastMode, () => tabs.value.length],
    ([enabled]) => {
      selectedTargets.value = enabled ? tabs.value.map(t => t.id) : []
    },
    { immediate: true }
  )
  return {
    tabs,
    activeId,
    activeTab,
    addTerminal,
    closeTab,
    getTab,
    destroy,
    showAgentTable,
    showAgents,
    agents,
    openAgentTerminal,
    onSelectionChange,
    setTerminalEl,
    broadcastMode,
    selectedTargets,
    command,
    sendBroadcast
  }
}
