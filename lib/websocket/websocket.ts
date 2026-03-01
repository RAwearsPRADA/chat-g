import { IUser } from "../types/WebSocketUser"
import type { ObjectValue, SetObject } from "../types/ObjectsArray.types"
import type { IResponse } from "@/app/api/me/route"
import type { Message, User } from "@/app/generated/prisma/client"

async function getWsToken(): Promise<IResponse | void> {
    try {
    const response = await fetch('/api/me')
    const data: IResponse = await response.json()
    return data
    } catch {
        return
    }
}
export interface IData {
    type: 'online users' | 'typing' | 'offline user' | "new message" ,
    data:
    {
        nick?: string,
        onlineUsers?: Record<keyof IUser, ObjectValue> | SetObject[]
        isTyping?: boolean,
        messageTarget?: number,
        message?: Omit<Message, 'createdAt' | 'id'>
    }
}

class WebSocketService {
    public messageHandler: (event: MessageEvent) => MessageEvent | void = (event: MessageEvent) => JSON.parse(event.data)
    private socket : WebSocket | null = null
    private data: User  | undefined
    async connect() {
        const response = await getWsToken()
        if (!response) return
        this.data = response.data
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return this.socket
        this.socket = new WebSocket(`ws://localhost:8080`)
        this.socket.onmessage = this.messageHandler
        this.socket.onopen = () => {
            if (this.socket?.readyState === WebSocket.OPEN)
            this.socket?.send(JSON.stringify({
                type: 'auth',
                data: {
                    nick: this.data!.nick
                }
            }))

        }
        this.socket.onclose = () => {
            console.log('WebSocket disconnected')
        }
        this.socket.onclose = (error) => {
            console.log(error)
        }
        return this.socket
    }

    setMessageHandler(callback: (event: MessageEvent) => MessageEvent | void) {
        this.messageHandler = callback
    }
    send(data: IData) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(typeof data === 'string'? data: JSON.stringify(data))
 
        } else {
            console.warn('WebSocket is not ready')
        }
    }
    disconnect() {
        this.socket?.close()
        this.socket = null
    }
    isConnected() {
        return this.socket?.readyState === WebSocket.OPEN
    }

}

export const ws = new WebSocketService()