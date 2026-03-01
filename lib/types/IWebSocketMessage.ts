export interface IWebSocketMessage {
    nick: string,
    action: string,
    target?: number
}