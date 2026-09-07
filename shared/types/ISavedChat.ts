export interface IChatMember {
    conversationId: number,
    user: {
        id: number,
        nick: string,
        createdAt: string | Date,
        avatar: string | null
    }
}

export interface ISelfSearched {
    type: 'SAVED',
    user: {
        nick: string,
        avatar: string | null,
        id: number
    },
    searched: true
}

export interface IUserSearched {
    type: "PRIVATE",
    user: {
        nick: string,
        avatar: string | null,
        id: number
    }
    searched: true
}

export type ISearchedItem = ISelfSearched | IUserSearched

export interface ILastMessage {
    content: string,
    createdAt: string | number,
    type: 'TEXT' | 'VOICE' | 'ATTACHMENT' | 'FORWARDED',
    senderId: number,
    isRead: boolean
}

export interface ISelfChat {
    chatId: number,
    type: 'SAVED',
    message: ILastMessage,
    user: {
        id: number,
        avatar: string | null,
        nick: string
    }
}

export interface IPrivateChat {
    chatId: number,
    type: 'PRIVATE',
    message: ILastMessage,
    user: {
        id: number,
        avatar: null | string,
        nick: string
    }
}

export interface IGroupChat {
    chatId: number,
    chatAvatar: string,
    chatTitle: string,
    type: 'GROUP',
    message: ILastMessage,
}

export interface IChannel extends Omit<IGroupChat, 'type'> {
    type: 'CHANNEL'
}


export type ISavedChat = ISelfChat | IPrivateChat | IChannel | IGroupChat
