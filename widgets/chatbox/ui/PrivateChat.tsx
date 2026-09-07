import { useBoundStore } from "@/shared/store/store"
import { useAutoScroll } from "@/shared/lib/hooks/useAutoScroll"
import { useMessageGrouping } from "../lib/useChatGrouping"
import { ChatInput } from "./ChatInput"
import { UserTyping } from "@/features/user-status/UserTyping"
import { UserRecordingVoice } from "@/features/user-status/UserRecordingVoice"
import { UserListeningOwnVoice } from "@/features/user-status/UserListeningOwnVoice"
import { IPrivateChat } from "@/shared/types/ISavedChat"
import { ScrollToBottomIcon } from "./ScrollToBottomIcon"

export function PrivateChat() {
    const chatId = useBoundStore(s => s.chatId)
    const chatboxState = useBoundStore(s => s.chatboxState) as IPrivateChat
    const onlineUsers = useBoundStore(s => s.onlineUsers)
    const chatsCache = useBoundStore(s => s.chatsCache)
    const currentChat = chatsCache.find(chat => chat.chatId === chatId)
    const {setAnchorRef, setContainerRef, isAtBottom, scrollToBottom} = useAutoScroll(currentChat?.chatHistory)
    const {chatHistory} = useMessageGrouping(currentChat?.chatHistory ?? []) 
    const member = onlineUsers.get(chatboxState.user.nick)
    const isMemberOnline = !!member
    const isMemberTyping = member?.isTyping
    const isRecordingVoice = member?.isRecording
    const isListeningOwnVoice = member?.isListeningOwnAudio
    const nothingDoing = !isMemberTyping && !isRecordingVoice && !isListeningOwnVoice
    return <>
        <div className={`${chatboxState ? 'flex' : 'hidden sm:flex'} chatbox-body`}>
            <ScrollToBottomIcon isAtBottom={isAtBottom} scrollToBottom={scrollToBottom}/>
            <div className="p-3.75 w-full bg-[rgba(255,255,255,0.1)]">
                <div className="member cursor-pointer">{chatboxState.user.nick}</div>
                    <div className="text-[#9b9b9b] text-[14px]">
                        {(isMemberTyping) && 
                            <UserTyping/>
                        }
                        {(isRecordingVoice) &&
                            <UserRecordingVoice/>
                        }
                        {(isListeningOwnVoice) &&
                            <UserListeningOwnVoice/>
                        }
                        {(!!nothingDoing) &&
                            <p className={`${isMemberOnline? 'text-[#0077ff]': 'offline'}`}>
                                {(isMemberOnline)?"Online": "Offline"}
                            </p>
                        }
                    </div>
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