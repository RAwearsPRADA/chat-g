import { useBoundStore } from "@/shared/store/store";
import { useAutoScroll } from "@/shared/lib/hooks/useAutoScroll";
import { useMessageGrouping } from "../lib/useChatGrouping";
import { ChatInput } from "./ChatInput";

export function SavedChat() {
    const chatId = useBoundStore(s => s.chatId)
    const chatsCache = useBoundStore(s => s.chatsCache)
    const currentChat = chatsCache.find(chat => chat.chatId === chatId)
    const {setAnchorRef, setContainerRef} = useAutoScroll(currentChat?.chatHistory)
    const {chatHistory} = useMessageGrouping(currentChat?.chatHistory ?? []) 
    return <>
        <div className="chatbox__container">
            <div className="chatbox__header">
                <div className="member cursor-pointer">Saved Messages</div>
            <div className="member__last-activity"/>
            </div>
            <ul className="chatbox__messages-container" ref={setContainerRef}>
                <div className="chat-start"/>
                    {chatHistory.length?
                        chatHistory:
                        <div className="start-chatting">Send message to start</div>
                        }
                <div className="chat-end" ref={setAnchorRef}/>
            </ul>
            <div className="chatbox__input-field bg-zinc-900">
                <ChatInput/>
            </div>
        </div>
    </>
}