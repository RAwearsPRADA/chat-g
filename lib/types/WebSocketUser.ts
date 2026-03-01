import { ObjectValue } from "./ObjectsArray.types"
import WebSocket from "ws"

export interface IUser extends Record<string, ObjectValue> {
    nick: string,
    message?: string
    isTyping: boolean,
    typingTarget: string | null,
    ws: WebSocket,
}