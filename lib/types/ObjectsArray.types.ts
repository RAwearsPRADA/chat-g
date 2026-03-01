import WebSocket from "ws"
export type ObjectValue = string | number | boolean | null | WebSocket | undefined
export type SetObject<T = never> = T extends never? Record<string, ObjectValue>: Record<keyof T, ObjectValue>