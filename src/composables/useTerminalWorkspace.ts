import { ref } from 'vue'
import { useTerminal } from './useTerminal'
import type { TerminalSession } from '@/services/clientApi'

export interface TerminalTab {
  id: string
  title: string
  el?: HTMLDivElement | null
  terminal: {
    open: (req: TerminalSession, el: HTMLDivElement) => Promise<void>
    resize: () => void
    destroy: () => void
    getSessionId: () => string | null
    send: (msg: string) => void
  }
}

export function useTerminalWorkspace() {
  const tabs = ref<TerminalTab[]>([])
  const activeId = ref<string | null>(null)

  async function addTerminal() {
    const terminal = useTerminal()
    const id = crypto.randomUUID()

    const tab: TerminalTab = {
      id,
      title: `Server-${tabs.value.length + 1}`,
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
      activeId.value = tabs.value[0]?.id || ''
    }
  }

  function getActiveTab() {
    return tabs.value.find(t => t.id === activeId.value)
  }

  function getTab(id: string): TerminalTab | undefined {
    return tabs.value.find(t => t.id === id)
  }

  return {
    tabs,
    activeId,
    addTerminal,
    closeTab,
    getActiveTab,
    getTab
  }
}
