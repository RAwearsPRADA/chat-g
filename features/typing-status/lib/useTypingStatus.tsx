import { useEffect, useCallback } from "react";
import { ws } from "@/shared/api/websocket";
import { useBoundStore } from "@/shared/store/store";

export function useTypingStatus() {
    const self = useBoundStore(s => s.self)
    const chatId = useBoundStore(s => s.chatId)
    const currentTypingStatus = useBoundStore(s => s.currentTypingStatus)
    const setCurrentTypingStatus = useBoundStore(s => s.setCurrentTypingStatus)
    const setTypingTimer = useBoundStore(s => s.setTypingTimer)
    const clearTypingTimer = useBoundStore(s => s.clearTypingTimer)
    const savedChats = useBoundStore(s => s.savedChats)
    const chatboxState = useBoundStore(s => s.chatboxState)

    const sendTypingStatus = useCallback((status: boolean) => {
        const savedChat = savedChats.find(chat => chat.chatId)
        if (currentTypingStatus === status)
            return
        if (!chatId || !savedChat|| !self || chatboxState?.type === 'SAVED') 
            return
        setCurrentTypingStatus(status)
        ws.send({
            type: 'typing',
            data: {
                nick: self.nick,
                messageTarget: chatId,
                isTyping: status
            }
        })
        
    }, [chatId, self, currentTypingStatus, savedChats, chatboxState, setCurrentTypingStatus])
    const handleInputChange = useCallback((value: string) => {
        if (value.length > 0) {
            clearTypingTimer()
            setTypingTimer(chatId, self!.nick)
            sendTypingStatus(true)
        }
        if (!value.length) {
            sendTypingStatus(false)
            clearTypingTimer()
        }
        
    }, [sendTypingStatus, setTypingTimer, clearTypingTimer, chatId, self])
    const sendStopTyping = useCallback(() => {
        clearTypingTimer()
        setCurrentTypingStatus(false)
        sendTypingStatus(false)

    }, [sendTypingStatus, clearTypingTimer, setCurrentTypingStatus])
    useEffect(() => {
        return () => {
            clearTypingTimer()
        }
    }, [chatId, clearTypingTimer])
    
    return {handleInputChange, sendTypingStatus, sendStopTyping}
}