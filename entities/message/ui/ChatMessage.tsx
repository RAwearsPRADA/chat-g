import { memo } from "react"
import type { User } from "@/shared/types/User"
import type { Message } from "@/shared/types/Message"
import { MessageAvatar } from "./MessageAvatar"
import { useBoundStore } from "@/shared/store/store"
import { formatTime } from "@/shared/lib/format-time/formatTime"


interface Props {
    message: Omit<Message, "id">,
    self: User,
    shouldShowAvatar: boolean,
    isTheSameAuthor: boolean,
}

function MessageComponent({message, self, shouldShowAvatar, isTheSameAuthor}: Props) {
    const observe = useBoundStore(s => s.observe)
    const chatboxState = useBoundStore(state => state.chatboxState)
    const formattedTime = formatTime(Number(message.createdAt))
    const messageRef = (node: HTMLLIElement | null) => {
        if (node && message.senderId !== self.id && !message.isRead) {
            observe(node!)
        }
    }
    const isSavedChat = chatboxState?.type === 'SAVED'
    return (
        <>
            <li className={`chat__message ${isTheSameAuthor? 'same-sender__message': ''} min-w-0 max-w-100`}
                data-timestamp={`${message.createdAt}`}
                data-is-read={message.senderId === self.id? true: message.isRead}
                ref={messageRef}
            >
                {(shouldShowAvatar && chatboxState!.type === 'PRIVATE') &&
                    <MessageAvatar user={chatboxState!.user} title={chatboxState!.user.nick}/>}
                {(shouldShowAvatar && chatboxState!.type === 'SAVED') &&
                    <MessageAvatar user={self} title={self.nick}/>
                }
                <div className={`message__text flex flex-col whitespace-pre-wrap wrap-break-word ${message.senderId === self.id? 'self': ""}`} style={{marginLeft: shouldShowAvatar? '': '25px'}}>
                    {message.content}
                    <div className="message__info">
                        <p className="message__date" title={formattedTime}>{formattedTime}</p>
                        {isSavedChat && <p className="message__status">✔✔</p>}
                        {(message.senderId === self.id && !isSavedChat) && <p className="message__status">{!!message.isRead? '✔✔':'✓'}</p>}
                    </div>
                </div>
            </li>
        </>
    )
}

export const ChatMessage = memo(MessageComponent)
