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
    const chatboxState = useBoundStore(s => s.chatboxState)
    return <>
        <div className={`${chatboxState ? 'flex' : 'hidden sm:flex'} chatbox-body`}>
            <div className="p-3.75 w-full bg-[rgba(255,255,255,0.1)]">
                <div className="member cursor-pointer">Saved Messages</div>
            <div className="text-[#9b9b9b] text-[14px]"/>
            </div>
            <ul className="chatbox-messages-container" ref={setContainerRef}>
                <div className="chat-start"/>
                    {chatHistory.length?
                        chatHistory:
                        <div className="start-chatting">Send message to start</div>
                        }
                <div className="chat-end" ref={setAnchorRef}/>
            </ul>
            <div className="flex gap-x-3.75 items-center py-2.5 justify-center w-[90%] rounded-t-[15px] bg-zinc-900">
                <ChatInput/>
            </div>
        </div>
    </>
}