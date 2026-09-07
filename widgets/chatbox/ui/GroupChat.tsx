import { useBoundStore } from "@/shared/store/store"
import { useAutoScroll } from "@/shared/lib/hooks/useAutoScroll"
import { useMessageGrouping } from "../lib/useChatGrouping"
import { useTypingStatus } from "@/features/typing-status/lib/useTypingStatus"
import { useChatActions } from "../lib/useChatActions"
import { useState } from "react"
import { ScrollToBottomIcon } from "./ScrollToBottomIcon"

export function GroupChat() {
    const [message, setMessage] = useState<string>('')
    const chatboxState = useBoundStore(s => s.chatboxState)!
    const chatsCache = useBoundStore(s => s.chatsCache)
    const chatId = useBoundStore(s => s.chatId)
    const currentChat = chatsCache.find(chat => chat.chatId === chatId)
    const {chatHistory} = useMessageGrouping(currentChat?.chatHistory || [])
    const {handleInputChange, sendStopTyping} = useTypingStatus()
    const {sendChatMessage} = useChatActions()
    const {setAnchorRef, setContainerRef, isAtBottom, scrollToBottom} = useAutoScroll(currentChat?.chatHistory)

    const handleSend = () => {
        if (!message.trim())
            return
        sendChatMessage(message)
        setMessage('')
        sendStopTyping()    
    }
    if (chatboxState.type === 'GROUP')
        return <>
            <div className={`${chatboxState ? 'flex' : 'hidden sm:flex'} chatbox-body`}>
                <ScrollToBottomIcon isAtBottom={isAtBottom} scrollToBottom={scrollToBottom}/>
                <div className="p-3.75 w-full bg-[rgba(255,255,255,0.1)]">
                    <div className="member">{chatboxState.chatTitle}</div>
                    <div className="member__last-activity">participants count</div>
                </div>
                <ul className="chatbox-messages-container" ref={setContainerRef}>
                    {(!currentChat?.chatHistory || !currentChat?.chatHistory.length) && 
                        <div className='start-chatting'>Send message to start chatting</div>
                    }
                        {chatHistory.length && chatHistory}
                <div className="chat-end" ref={setAnchorRef}/>
                </ul>
                <div className="chatbox__input-field">
                    <input type="text" id="message" placeholder='Type message pls' value={message} onChange={(event) => {
                        handleInputChange(event.target.value)}} 
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleSend()
                            }}}
                        />
                    <button className={`send__message-btn ${message.trim()? 'active': ''}`} title='Send message' onClick={handleSend}>✉️</button>
                </div>
            </div>
        </>
    return null
}