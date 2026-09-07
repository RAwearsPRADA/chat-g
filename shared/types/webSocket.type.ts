export interface IWebSocketMessage {
    type: string,
    userNick?: string,
    message?: string,
    data: {
        usersOnline: string[]
    }
}

