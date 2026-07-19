import { ref, onBeforeUnmount, useTemplateRef, nextTick } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WSClient, type TerminalMessage } from '../services/ws'

const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL as string

export function useTerminal(targetType: string, agentId?: string) {
  const container = ref<HTMLDivElement | null>(null)
  const sessionId = ref<string | null>(null)

  let term: Terminal | null = null
  let fit: FitAddon | null = null
  let ws: WSClient | null = null

  async function open(el: HTMLDivElement) {
    container.value = el

    await nextTick()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        init()
      })
    })
  }

  function init() {
    if (!container.value) return

    sessionId.value = crypto.randomUUID()

    // terminal
    term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      convertEol: true,
      fontFamily: "'JetBrains Mono', monospace"
    })

    fit = new FitAddon()
    term.loadAddon(fit)

    term!.open(container.value)
    fit.fit()

    // ws
    let url = `${wsBaseUrl}/${sessionId.value}?targetType=${targetType}`
    if ('AGENT' === targetType) {
      url += `&agentId=${agentId}`
    }

    ws = new WSClient(url)

    console.log('open session: ', sessionId.value)

    ws.connect(
      data => term?.write(data),
      () => term?.writeln('\r\n[Disconnected]\r\n')
    )

    term.onData(data => {
      ws?.send({
        type: 'INPUT',
        data
      })
    })

    window.addEventListener('resize', resize)

    requestAnimationFrame(() => resize())

    resize()
  }

  function resize() {
    if (!sessionId.value || !fit || !term || !ws) return

    fit.fit()
    console.log('resize clos=' + term.cols + ', rows=' + term.rows)
    ws.send({
      sessionId: sessionId.value,
      type: 'RESIZE',
      cols: term.cols,
      rows: term.rows
    })
  }

  async function destroy() {
    console.log('close session ', sessionId?.value)
    window.removeEventListener('resize', resize)

    ws?.close()
    term?.dispose()

    ws = null
    term = null
    fit = null
    sessionId.value = null
    container.value = null
  }

  function getSessionId() {
    return sessionId.value
  }

  function send(data: string) {
    ws?.send({
      type: 'INPUT',
      data
    })
  }

  return {
    open,
    resize,
    getSessionId,
    send,
    destroy
  }
}
