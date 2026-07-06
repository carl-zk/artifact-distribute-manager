import { ref, onBeforeUnmount, useTemplateRef, nextTick } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WSClient, type TerminalMessage } from '../services/ws'
import { openTerminalSession, type TerminalSession } from '@/services/clientApi'

const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL as string

export function useTerminal() {
  const container = ref<HTMLDivElement | null>(null)
  const sessionId = ref<string | null>(null)

  let term: Terminal | null = null
  let fit: FitAddon | null = null
  let ws: WSClient | null = null
  let opened: boolean = false

  async function open(req: TerminalSession, el: HTMLDivElement) {
    console.log('[open] container is ', container.value, el)
    container.value = el
    const sessions = await openTerminalSession([req])

    sessionId.value = sessions[0]?.sessionId!

    console.log('[open] session id is ', sessionId.value)

    await nextTick()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        init()
      })
    })
  }

  function resize() {
    if (!sessionId.value || !fit || !term || !ws) return

    fit.fit()

    ws.send({
      sessionId: sessionId.value,
      type: 'RESIZE',
      cols: term.cols,
      rows: term.rows
    })
  }

  function init() {
    if (!container.value || !sessionId.value) return

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
    ws = new WSClient(`${wsBaseUrl}/${sessionId.value}`)

    console.log('open session: ', sessionId.value)

    ws.connect(
      data => term?.write(data),
      () => term?.writeln('\r\n[Disconnected]\r\n')
    )

    term.onData(data => {
      ws?.send({
        sessionId: sessionId.value!,
        type: 'INPUT',
        data
      })
    })

    window.addEventListener('resize', resize)

    requestAnimationFrame(() => resize())
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
    opened = false
  }

  function getSessionId() {
    return sessionId.value
  }

  function send(data: string) {
    ws?.send({
      type: 'INPUT',
      sessionId: sessionId.value!,
      data
    })
  }

  return {
    open,
    resize,
    getSessionId,
    send,
    destroy,
    opened
  }
}
