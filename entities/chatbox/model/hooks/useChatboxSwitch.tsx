import type { User } from "@/shared/types/User";
import type { ISavedChat, ISearchedItem } from "@/shared/types/ISavedChat";
import { getChatHistory } from "@/features/search-general-chat/lib/getChatHistory";
import { useBoundStore } from "@/shared/store/store";
import { useCallback, useEffect, useRef } from "react";
import { createNewChat } from "@/features/create-new-chat/createNewChat";


export function useChatboxSwitch(self: User | null) {
    const chatsCache = useBoundStore(s => s.chatsCache)
    const savedChats = useBoundStore(s => s.savedChats)
    const chatboxState = useBoundStore(s => s.chatboxState)
    const {setChatboxState, setChatsCache, setChatId} = useBoundStore.getState()
    const cacheRef = useRef(chatsCache)
    useEffect(() => {
        cacheRef.current = chatsCache
    }, [chatsCache])

    const switchChatboxWindow = useCallback(async (item: ISavedChat | ISearchedItem) => {
        setChatboxState(item)
        if ('searched' in item){ //if it's searched item 
            if (item.type === 'SAVED') {
                const cachedChat = cacheRef.current.find(chat => chat.chatType === 'SAVED')
                const savedChat = savedChats.find(chat => chat.type === 'SAVED')
                if (cachedChat) {
                    setChatId(cachedChat.chatId)
                } else if (savedChat) {
                    const response = await getChatHistory(savedChat.chatId)
                    if (response.chatHistory.length) {
                        setChatsCache([{
                            chatId: savedChat.chatId, 
                            chatHistory: response.chatHistory, 
                            chatType: 'SAVED'}, ...cacheRef.current])
                    }
                    setChatId(savedChat.chatId)
                } else {
                    const data = await createNewChat(self!.id, item.user.id, "SAVED")
                    if (data) {
                        setChatId(data.chat.id)
                    }
                    else 
                        setChatId(-1)
                }
            }
            else if (item.type === 'PRIVATE') {
                const cachedChat = cacheRef.current.find((chat) => (chat.chatType === 'PRIVATE' && chat.participant.nick === item.user.nick))
                const savedChat = savedChats.find(chat => (chat.type === 'PRIVATE' && chat.user.nick === item.user.nick))
                if (cachedChat){
                    setChatId(cachedChat.chatId)
                } else if (savedChat) {
                    const response = await getChatHistory(savedChat.chatId)
                    if (response.chatHistory.length) {
                        setChatsCache([{
                            chatId: savedChat.chatId, 
                            chatHistory: response.chatHistory, chatType: 'PRIVATE', participant: item.user}, 
                            ...cacheRef.current])
                        setChatId(savedChat.chatId)
                    }
                } else {
                    const newChat = await createNewChat(self!.id, item.user.id, "PRIVATE")
                    if (newChat) {
                        setChatId(newChat.chat.id)
                    }
                    else 
                        setChatId(-1)
                }
            }
            return
            
        } 
        if (chatboxState && item.chatId === (chatboxState as ISavedChat).chatId) //if already opened
            return;
        if (item.type === 'SAVED') { //self chat
            const cachedChat = cacheRef.current.find(chat => chat.chatId === item.chatId) //looking for chat in cache
            if (cachedChat) {
                setChatId(cachedChat.chatId)
            }
            else if (savedChats.find(chat => chat.chatId === item.chatId)) {
                setChatId(item.chatId)
                const response = await getChatHistory(item.chatId)
                if (response.chatHistory.length) {
                    setChatsCache([{chatId: item.chatId, chatHistory: response.chatHistory!, chatType: item.type}, ...cacheRef.current])
                } else {
                    setChatId(-1)
                }
            } else {
                setChatId(-1)
            }
        } else if (item.type === 'PRIVATE') { //self !== item
            const cachedChat = cacheRef.current.find(chat => chat.chatId === item.chatId)
            if (cachedChat) {
                setChatId(cachedChat.chatId)
            } else if (savedChats.find(chat => (chat.chatId === item.chatId))) {
                setChatId(item.chatId)
                const response = await getChatHistory(item.chatId)
                if (response.chatHistory.length) {
                    setChatsCache([{
                        chatId: item.chatId, 
                        chatHistory: response.chatHistory!, 
                        chatType: item.type, 
                        participant: {
                            avatar: item.user.avatar,
                            id: item.user.id,
                            nick: item.user.nick
                        }
                    }, ...cacheRef.current])
                } else {
                    setChatId(-1)
                }
            } else {
                setChatId(-1)
            }
        } else if ('type' in item) {

        }
    }, [chatboxState, self, savedChats, setChatId, setChatboxState, setChatsCache])
    return {switchChatboxWindow}
}