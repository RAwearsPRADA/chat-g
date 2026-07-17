
export interface ChatWebSocket {
    nick: string,
    id: number,
    chats: Set<number>,
    isClosed: boolean
}