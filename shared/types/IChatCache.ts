import type { Message } from "./Message"
import { User } from "./User"


export interface ISavedChatCache {
    chatId: number,
    chatHistory: Message[],
    chatType: 'SAVED'
}

export interface IPrivateChatCache {
    chatId: number,
    chatHistory: Message[],
    chatType: 'PRIVATE',
    participant: Pick<User, 'id' | 'avatar' | 'nick'>
}

export interface IGroupChatCache {
    chatId: number,
    chatHistory: Message[],
    chatType: 'GROUP'
}

export interface IChannelCache {
    chatId: number,
    chatHistory: Message[],
    chatType: 'CHANNEL'
}

export type IChatsCache = ISavedChatCache | IPrivateChatCache | IGroupChatCache | IChannelCache