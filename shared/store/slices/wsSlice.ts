import type { IUserSession } from "@/shared/types/IUserSession";
import type { StateCreator } from "zustand";
import type { Response } from "@/shared/api/types/responses";
import type { ISavedChat } from "@/shared/types/ISavedChat";
import type { ChatSlice } from "./chatSlice";


interface CombinedSlices extends WSSlice, ChatSlice {}

export interface WSSlice {
    wsStatus: string,
    setWsStatus: (status: string) => void,
    onlineUsers: Map<string, Omit<IUserSession, 'ws' | 'chats'>>,
    setOnlineUsers: (onlineUsers: Map<string, Omit<IUserSession, 'ws'>>) => void
    wsMessageHandler: (event: MessageEvent) => void
    setAudio: (audioPlayer: () => void) => void
    playAudio: () => void
}

export const createWSSlice: StateCreator<CombinedSlices, [], [], WSSlice> = (set) => ({
    onlineUsers: new Map(),
    wsStatus: '',
    playAudio: () => {},
    setWsStatus: (status) => set({
        wsStatus: status
    }),
    setAudio: (player: () => void) => set({playAudio: player}),
    setOnlineUsers: (onlineUsers: Map<string, Omit<IUserSession, 'ws'>>) => set({onlineUsers}),
    wsMessageHandler: (event: MessageEvent) => {
            const message: Response = JSON.parse(event.data)
            switch (message.type) {
                case "new user connected":
                    set((state) => ({
                        onlineUsers: new Map(state.onlineUsers).set(message.data.nick, {
                            isTyping: false, 
                            actionTarget: null, 
                            isRecording: false,
                            isListeningAudio: false,
                            isListeningOwnAudio: false,
                            isSendingVoiceMessage: false
                        })
                    }))
                    break
                case "user disconnected":
                    set(state => {
                        const newOnlineList = new Map(state.onlineUsers)
                        newOnlineList.delete(message.data.nick)
                        return {onlineUsers: newOnlineList}
                    })
                    break
                case 'online users':
                    const defaultState: Omit<IUserSession, 'ws' | 'chats'> = {actionTarget: null, isTyping: false, isListeningAudio: false, isListeningOwnAudio: false, isRecording: false, isSendingVoiceMessage: false}
                    const onlineUsers = new Map<string, typeof defaultState>()
                    message.data.onlineUsers.forEach(nick => onlineUsers.set(nick, {...defaultState}))
                    set({
                        onlineUsers: onlineUsers
                    })
                    break
                case 'typing':
                    set((state) => {
                        const copy = new Map(state.onlineUsers)
                        const prev = copy.get(message.data.nick)
                        copy.set(message.data.nick, {
                            ...prev!,
                            isTyping: message.data.isTyping,
                            actionTarget: message.data.messageTarget
                        })
                        return {onlineUsers: copy}
                    })
                    break
                case 'new message':
                    set((state) => {
                        if (!state.chatboxState)
                            state.playAudio()
                        else if ('searched' in state.chatboxState)
                            state.playAudio()
                        else if (state.chatboxState.chatId !== message.data.messageTarget)
                            state.playAudio()
                        else if ('title' in state.chatboxState && state.chatboxState.chatId !== message.data.messageTarget)
                            state.playAudio()
                        const targetId = message.data.messageTarget
                        if (!targetId) return state
                        const messageData = message.data.message
                        const cachedIndex = state.chatsCache.findIndex(chat => chat.chatId === targetId)
                        const savedChatIndex = state.savedChats.findIndex(chat => chat.chatId === targetId)
                        const nextChatsCache = [...state.chatsCache]
                        const nextSavedChats = [...state.savedChats]
                        const nextOnlineUsers = new Map(state.onlineUsers)

                        if (cachedIndex !== -1) { //chat is cached
                            const cachedChat = nextChatsCache[cachedIndex]
                            const savedChat = nextSavedChats[savedChatIndex]
                            const updatedCache = {
                                ...cachedChat,
                                chatHistory: [...cachedChat.chatHistory, message.data.message]
                            }
                            const updatedSavedChat = {
                                ...savedChat,
                                message: {
                                    ...messageData
                                }     
                            }
                
                            nextChatsCache.splice(cachedIndex, 1)
                            nextChatsCache.unshift(updatedCache)
                            nextSavedChats.splice(savedChatIndex, 1)
                            nextSavedChats.unshift(updatedSavedChat)
                        }
                
                        if (savedChatIndex !== -1 && cachedIndex === -1) { //chat in saved chats
                            const savedChat = nextSavedChats[savedChatIndex]
                            
                            const updatedSaved = {
                                ...savedChat,
                                message: {
                                    ...messageData
                                }
                            }
                
                            nextSavedChats.splice(savedChatIndex, 1)
                            nextSavedChats.unshift(updatedSaved)
                        } 
                        else if (cachedIndex === -1 && savedChatIndex === -1) {
                            const newSavedChat: ISavedChat = {
                                chatId: targetId,
                                type: 'PRIVATE',
                                message: message.data.message,
                                user: {
                                    id: message.data.user.id,
                                    avatar: message.data.user.avatar,
                                    nick: message.data.user.nick
                                }
                            } 
                            nextSavedChats.unshift(newSavedChat)
                        }
                        nextOnlineUsers.set(
                            message.data.user.nick, 
                            {isListeningAudio: false, isListeningOwnAudio: false, isRecording: false, 
                                isSendingVoiceMessage: false, 
                                isTyping: false, actionTarget: null}
                        )
                        return {
                            chatsCache: nextChatsCache,
                            savedChats: nextSavedChats,
                            onlineUsers: nextOnlineUsers
                        }
                    })
                    break
                case 'recording message':
                    set((state) => {
                        const nick = message.data.nick
                        const copy = new Map(state.onlineUsers)
                        const isListeningOwnVoice = message.data.isRecording? false: true
                        copy.set(nick, {
                            isTyping: false, 
                            actionTarget: message.data.messageTarget, 
                            isRecording: message.data.isRecording,
                            isListeningAudio: false,
                            isListeningOwnAudio: isListeningOwnVoice,
                            isSendingVoiceMessage: false
                        })
                        return {onlineUsers: copy}
                    })
                    break
                case 'listening own voice message':
                    set((state) => {
                        const nick = message.data.nick
                        const copy = new Map(state.onlineUsers)
                        copy.set(nick, {
                            isTyping: false,
                            isListeningAudio: false,
                            isListeningOwnAudio: message.data.isListening,
                            isRecording: false,
                            actionTarget: message.data.messageTarget,
                            isSendingVoiceMessage: false
                        })
                        return {onlineUsers: copy}
                    })
                    break
                case 'listening voice message':
                    set((state) => {
                        const nick = message.data.nick
                        const copy = new Map(state.onlineUsers)
                        copy.set(nick, {
                            isListeningAudio: message.data.isListening,
                            isListeningOwnAudio: false,
                            isRecording: false,
                            isTyping: false,
                            actionTarget: message.data.messageTarget,
                            isSendingVoiceMessage: false
                        })
                        return {onlineUsers: copy}
                    })
                    break

                case 'removed voice message':
                    set((state) => {
                        const nick = message.data.nick
                        const copy = new Map(state.onlineUsers)
                        copy.set(nick, {
                            actionTarget: null,
                            isListeningAudio: false,
                            isListeningOwnAudio: false,
                            isRecording: false,
                            isTyping: false,
                            isSendingVoiceMessage: false
                        })
                        return {onlineUsers: copy}
                    })
                    break
                case 'sending voice message':
                    set((state) => {
                        const nick = message.data.nick
                        const copy = new Map(state.onlineUsers)
                        copy.set(nick, {
                            actionTarget: null,
                            isListeningAudio: false,
                            isListeningOwnAudio: false,
                            isRecording: false,
                            isTyping: false,
                            isSendingVoiceMessage: true
                        })
                        return {onlineUsers: copy}
                    })
                    break
                case "read message": 
                    set((state) => {
                        const chat = state.chatsCache.find(chat => chat.chatId === message.data.messageTarget)
                        const newSavedChats = state.savedChats.map(chat => {
                            if (chat.chatId === message.data.messageTarget && 
                                Number(chat.message.createdAt) <= message.data.lastMessageTimestamp) {
                                return {...chat, message: {...chat.message, isRead: true}}
                            } 
                            return chat
                        })
                        if (!chat)
                            return {savedChats: newSavedChats}
                        const timestamp = message.data.lastMessageTimestamp
                        const newChatHistory = chat?.chatHistory.map(message => {
                            if (message.createdAt <= timestamp) {
                                return {...message, isRead: true}
                            }
                            else return message
                        })
                        return {chatsCache: 
                            [{...chat, chatHistory: newChatHistory}, ...state.chatsCache.filter(chat => chat.chatId !== message.data.messageTarget)],
                            savedChats: newSavedChats
                        }
                    })
                    break
            }
        }
})