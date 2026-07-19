import { computed, ref } from 'vue'
import { useTerminal } from './useTerminal'

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

  return {
    tabs,
    activeId,
    activeTab,
    addTerminal,
    closeTab,
    getTab,
    destroy
  }
}
