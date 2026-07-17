import type { User } from "@/shared/types/User";
import type { Message } from "@/shared/types/Message";
import type { IChatsCache } from "@/shared/types/IChatCache";
import type { ISavedChat, ISearchedItem } from "@/shared/types/ISavedChat";
import type { StateCreator } from "zustand";
import { ws } from "@/shared/api/websocket";

export interface ChatSlice {
    chatboxState: ISavedChat | ISearchedItem | null,
    chatId: number,
    self: User | null,
    chatsCache: IChatsCache[],
    savedChats: ISavedChat[],
    currentTypingStatus: boolean,
    typingTimer: NodeJS.Timeout | null,
    setChatsCache: (chatsCache: IChatsCache[]) => void,
    setSavedChats: (savedChats: ISavedChat[]) => void,
    setChatboxState: (chatboxState: ISavedChat | ISearchedItem) => void,
    setChatId: (chatId: number) => void,
    setSelfInfo: (info: User) => void,
    setCurrentTypingStatus: (status: boolean) => void,
    addMessageToCache: (message: Message) => void
    setTypingTimer: (chatId: number, nick: string) => void,
    clearTypingTimer: () => void
}

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (set) => ({
    typingTimer: null,
    currentTypingStatus: false,
    isTypingAllowed: true,
    chatId: 0,
    chatboxState: null,
    chatsCache: [],
    savedChats: [],
    self: null,
    setChatsCache: (chatsCache: IChatsCache[]) => set({
        chatsCache
    }),
    setSavedChats: (savedChats: ISavedChat[]) => set({
        savedChats
    }),
    setChatboxState: (chatboxState) => set({
      chatboxState  
    }),
    setChatId: (chatId: number) =>  set({
      chatId  
    }),
    setSelfInfo: (self: User) => set({
        self
    }),
    addMessageToCache: (message: Message) => set ((state) => {
        const chatIndex = state.chatsCache.findIndex(chat => chat.chatId === message.conversationId)
        if (chatIndex === -1)
            return state
        const updatedCache = [...state.chatsCache]
        const newChat = {
            ...updatedCache[chatIndex], 
            chatHistory: [...updatedCache[chatIndex].chatHistory, message]
        }
        updatedCache[chatIndex] = newChat
        return {chatsCache: updatedCache}
    }),
    clearTypingTimer: () => set((state) => {
        if (state.typingTimer)
            clearTimeout(state.typingTimer)
        return {typingTimer: null}
    }),
    setTypingTimer: (chatId: number, nick: string) => set(state => {
        if (state.typingTimer)
            clearTimeout(state.typingTimer)
        const timer = setTimeout(() => {
            ws.send({
                type: 'typing',
                data: {
                    isTyping: false,
                    messageTarget: chatId,
                    nick: nick
                }
            })
        }, 1500)
        return {typingTimer: timer}
    }),
    setCurrentTypingStatus: (status) => set(() => {
        return {currentTypingStatus: status}
    })
})