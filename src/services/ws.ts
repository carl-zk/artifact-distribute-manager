export type TerminalMessage =
    | { type: "INPUT"; data: string; sessionId: string }
    | { type: "RESIZE"; cols: number; rows: number; sessionId: string }
    | { type: "CLOSE"; sessionId: string }
    | { type: "OUTPUT"; data: string; sessionId: string };

export class WSClient {
    private socket: WebSocket | null = null;

    constructor(private url: string) { }

    connect(onMessage: (data: string | Uint8Array) => void, onClose?: () => void) {
        this.socket = new WebSocket(this.url);
        this.socket.binaryType = "arraybuffer";

        const decoder = new TextDecoder("utf-8"); // leave it for future usage
        const encoder = new TextEncoder()

        this.socket.onmessage = async (e) => {
            console.log(typeof e.data, e.data)

            let text: string | Uint8Array;

            if (typeof e.data === "string") {
                text = encoder.encode(e.data)
            } else if (e.data instanceof ArrayBuffer) {
                text = new Uint8Array(e.data)
            } else {
                return;
            }
            onMessage(text)
        };

        this.socket.onclose = () => {
            onClose?.();
        };
    }

    send(msg: TerminalMessage) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(msg));
        }
    }

    close() {
        this.socket?.close();
        this.socket = null;
    }

    isOpen() {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}