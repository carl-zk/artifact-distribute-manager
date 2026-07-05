import { ref, onBeforeUnmount, useTemplateRef, nextTick } from "vue";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WSClient, type TerminalMessage } from "../services/ws";
import { openTerminalSession, type TerminalSession } from "@/services/clientApi";

const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL as string

export function useTerminalWS() {
    const container = useTemplateRef<HTMLDivElement>('container')
    const sessionId = ref<string | null>(null);

    let term: Terminal | null = null;
    let fitAddon: FitAddon | null = null;
    let ws: WSClient | null = null;

    async function open(req: TerminalSession) {
        const sessions = await openTerminalSession([req])

        sessionId.value = sessions[0]?.sessionId!

        await nextTick()
        await new Promise(requestAnimationFrame)

        init()
    }

    function resize() {
        if (!sessionId.value || !fitAddon || !term || !ws) return;

        fitAddon.fit();

        ws.send({
            sessionId: sessionId.value,
            type: "RESIZE",
            cols: term.cols,
            rows: term.rows,
        });
    }

    function init() {
        if (!container.value || !sessionId.value) return;

        // terminal
        term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            convertEol: true,
            fontFamily: "'JetBrains Mono', monospace",
        });

        fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term!.open(container.value)

        fitAddon.fit()
        resize()


        // ws
        ws = new WSClient(`${wsBaseUrl}/${sessionId.value}`);

        console.log('open session: ', sessionId.value)

        ws.connect(
            (data) => term?.write(data),
            () => term?.writeln("\r\n[Disconnected]\r\n")
        );

        term.onData((data) => {
            ws?.send({
                sessionId: sessionId.value!,
                type: "INPUT",
                data,
            });
        });

        window.addEventListener("resize", resize);
    }

    function destroy() {
        console.log("close session ", sessionId?.value)
        window.removeEventListener("resize", resize);

        ws?.close();
        term?.dispose();

        ws = null;
        term = null;
        fitAddon = null;
        sessionId.value = null
    }

    onBeforeUnmount(destroy);

    return {
        container,
        open,
    };
}