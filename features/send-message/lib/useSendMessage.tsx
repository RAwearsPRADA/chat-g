import type { User } from '@/shared/types/User'
import type { Message } from '@/shared/types/Message'
import { useCallback } from 'react'
import { ws } from '@/shared/api/websocket'
import { useBoundStore } from '@/shared/store/store'



export function useSendMessage(chatId: number, self: User | null) {
    const addMessageToCache = useBoundStore(s => s.addMessageToCache)
    const setCurrentTypingStatus = useBoundStore(state => state.setCurrentTypingStatus)
    const scrollToBottom = useBoundStore(s => s.forcedScrollToBottom)
    const clearTypingTimer = useBoundStore(state => state.clearTypingTimer)
    const sendMessage = useCallback(async (message: Message, isFirstMessage: boolean = false) => {
    if (!message.content.trim() || !self) 
        return
    ws.send({ 
        type: 'new message',
        data: {
            message: message,
            isTyping: false,
            messageTarget: message.conversationId,
            user: self,
            }
    })
    clearTypingTimer()
    setCurrentTypingStatus(false)
    if (!isFirstMessage) {
        addMessageToCache(message)
    } 
    scrollToBottom(true)
    }, [self, clearTypingTimer, setCurrentTypingStatus, addMessageToCache, scrollToBottom])

    return { sendMessage }
}