import type { Request } from "./types/requests"

class WebSocketService {
    public ticket: string = ''
    public statusHandler: (status: string) => void = () => {}
    public messageHandler: (event: MessageEvent) => MessageEvent | void = () => {}
    private socket : WebSocket | null = null
    private isManuallyClosed: boolean = false
    private reconnectTimeout: NodeJS.Timeout | null = null
    private reconnectCount: number = 0
    private reconnectTime = 2000 // 10s
    private pingInverval: NodeJS.Timeout = setInterval(() => {}, 1000000)

    async connect(ticket: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) 
            return this.socket
        if (!ticket.length) 
            return
        this.ticket = ticket
        clearInterval(this.pingInverval)
        this.socket = new WebSocket(`ws://127.0.0.1:2379?ticket=${ticket}`)
        this.setPingInverval()
        this.statusHandler('connecting')
        this.socket.onmessage = this.messageHandler

        this.socket.onclose = () => {
            console.log('WebSocket disconnected')
            this.statusHandler('closed')
            clearInterval(this.pingInverval)
            if (this.isManuallyClosed) 
                return
            const delay = (++this.reconnectCount) * this.reconnectTime
            this.reconnectTimeout = setTimeout(async () => {
                if (this.reconnectCount < 10)
                    this.connect(this.ticket)
            }, delay)

        }
        this.socket.onopen = () => {
            this.statusHandler('connected')
            this.reconnectCount = 0
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout)
                this.reconnectTimeout = null
            }
        }
        this.socket.onerror = (error) => {
            console.log(error)
        }
        return this.socket
        

    }
    public setStatusHandler(callback: (status: string) => void): void {
        this.statusHandler = callback
    }

    public setMessageHandler(callback: (event: MessageEvent) => MessageEvent | void) {
        this.messageHandler = callback
    }
    public send(data: Request, isPing = false) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            if (isPing)
                this.socket.send(typeof data === 'string'? data: JSON.stringify(data))
            else {
                clearInterval(this.pingInverval)
                this.socket.send(typeof data === 'string'? data: JSON.stringify(data))
                this.setPingInverval()
            }
 
        } else {
            console.warn('WebSocket is not ready')
        }
    }
    public disconnect() {
        this.socket?.close()
        this.socket = null
        this.isManuallyClosed = true
        clearInterval(this.pingInverval)
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = null
        }
    }
    public isConnected() {
        return this.socket?.readyState === WebSocket.OPEN
    }
    
    private setPingInverval() {
        clearInterval(this.pingInverval)
            this.pingInverval = setInterval(() => {
                this.send({
                    type: 'ping',
                    data: {messageTarget: 0}
                }, true)
            }, 58 * 1000)
    }

}

export const ws = new WebSocketService()