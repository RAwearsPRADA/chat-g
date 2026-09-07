import { useBoundStore } from "@/shared/store/store";
import { useCallback } from "react";
import { useSendMessage } from "@/features/send-message/lib/useSendMessage";


export function useChatActions() {
    const self = useBoundStore(s => s.self)
    const chatId = useBoundStore(s => s.chatId)
    const chatboxState = useBoundStore(s => s.chatboxState)
    const chatsCache = useBoundStore(s => s.chatsCache)
    const setChatsCache = useBoundStore(s => s.setChatsCache)
    const savedChats = useBoundStore(s => s.savedChats)
    const setSavedChats = useBoundStore(s => s.setSavedChats)
    const {sendMessage} = useSendMessage(chatId, self!)

    const sendChatMessage = useCallback(async (message: string) => {
        if (!self)
            return
        const sendingMessage = {
            id: 0, content: message.trim(), conversationId: chatId, senderId: self.id, 
            createdAt: Date.now(), isRead: false, type: 'TEXT' as const
        }
        if (!sendingMessage.content.trim() || !chatboxState)
            return
        const savedChat = savedChats.find(chat => chat.chatId === chatId)
        if (!savedChat) {
            sendMessage(sendingMessage, true)
            if (chatboxState.type === 'PRIVATE') {
                setSavedChats([{
                    chatId: chatId,
                    user: chatboxState.user,
                    message: sendingMessage,
                    type: "PRIVATE"
                }, ...savedChats.filter(chat => chat.chatId !== chatId)])

                setChatsCache([{
                    chatId: chatId,
                    chatHistory: [sendingMessage],
                    chatType: 'PRIVATE',
                    participant: chatboxState.user
                }, ...chatsCache])

            } else if (chatboxState.type === 'SAVED') {
                setSavedChats([{
                    chatId: chatId,
                    user: self,
                    message: sendingMessage,
                    type: 'SAVED'
                }, ...savedChats])

                setChatsCache([{
                    chatHistory: [sendingMessage],
                    chatId: chatId,
                    chatType: "SAVED"
                }, ...chatsCache])
            }
        return
        }
        sendMessage(sendingMessage, false)
        setSavedChats([{
            ...savedChat,
            message: sendingMessage
            }, ...savedChats.filter(chat => chat.chatId !== chatId)])
    }, [chatboxState, self, setChatsCache, setSavedChats, chatId, chatsCache, savedChats, sendMessage])
    return {sendChatMessage}
}