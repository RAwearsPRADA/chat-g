import type { Message } from "@/shared/types/Message";
import { ChatMessage } from "@/entities/message/ui/ChatMessage";
import { useCallback, useMemo } from "react";
import { useBoundStore } from "@/shared/store/store";


export function useMessageGrouping(messages: Message[] | Omit<Message, "id">[]) {
    const self = useBoundStore(s => s.self)
    const shouldShowAvatar = useCallback((index: number): boolean => {
        const current = messages[index]
        const next = messages[index + 1]
        if (!next || Number(next.createdAt) - Number(current.createdAt) > 5 * 60 * 1000)
            return true
        return !(next.senderId === current.senderId)
    }, [messages])

    const isFromTheSameAuthor = useCallback((index: number): boolean => {
        const current = messages[index]
        const previous = messages[index - 1]
        if (!previous || Number(current.createdAt) - Number(previous.createdAt) > 5 * 60 * 1000)
            return false
        return !!(current.senderId === previous.senderId)
    }, [messages])
    
    const chatHistory = useMemo(() => {return messages.map((message, index) => 
            {
            if (self) 
                return <ChatMessage 
                    key={`${message.createdAt.toString()}-${message.senderId}-${index}`} 
                    isTheSameAuthor={isFromTheSameAuthor(index)} 
                    message={message} self={self!} 
                    shouldShowAvatar={shouldShowAvatar(index)}
                />
            else
                return null
            }
    )}, [messages, self, shouldShowAvatar, isFromTheSameAuthor])

    return {chatHistory}
}