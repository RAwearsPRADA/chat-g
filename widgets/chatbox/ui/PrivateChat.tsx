import { useBoundStore } from "@/shared/store/store"
import { useAutoScroll } from "@/shared/lib/hooks/useAutoScroll"
import { useMessageGrouping } from "../lib/useChatGrouping"
import { ChatInput } from "./ChatInput"
import { UserTyping } from "@/features/user-status/UserTyping"
import { UserRecordingVoice } from "@/features/user-status/UserRecordingVoice"
import { UserListeningOwnVoice } from "@/features/user-status/UserListeningOwnVoice"
import { IPrivateChat } from "@/shared/types/ISavedChat"

export function PrivateChat() {
    const chatId = useBoundStore(s => s.chatId)
    const chatboxState = useBoundStore(s => s.chatboxState) as IPrivateChat
    const onlineUsers = useBoundStore(s => s.onlineUsers)
    const chatsCache = useBoundStore(s => s.chatsCache)
    const currentChat = chatsCache.find(chat => chat.chatId === chatId)
    const {setAnchorRef, setContainerRef} = useAutoScroll(currentChat?.chatHistory)
    const {chatHistory} = useMessageGrouping(currentChat?.chatHistory ?? []) 
    const member = onlineUsers.get(chatboxState.user.nick)
    const isMemberOnline = !!member
    const isMemberTyping = member?.isTyping
    const isRecordingVoice = member?.isRecording
    const isListeningOwnVoice = member?.isListeningOwnAudio
    const nothingDoing = !isMemberTyping && !isRecordingVoice && !isListeningOwnVoice
    return <>
        <div className="chatbox__container">
            <div className="chatbox__header">
                <div className="member cursor-pointer">{chatboxState.user.nick}</div>
                    <div className="member__last-activity">
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
                            <p className={`user__status ${isMemberOnline? 'online': 'offline'}`}>
                                {(isMemberOnline)?"Online": "Offline"}
                            </p>
                        }
                    </div>
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