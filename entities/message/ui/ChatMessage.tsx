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
            <li className={`flex max-w-[70%] w-max gap-x-1.25 items-end rounded-[15px] ${isTheSameAuthor? '-mt-3': ''} min-w-0 max-w-100`}
                data-timestamp={`${message.createdAt}`}
                data-is-read={message.senderId === self.id? true: message.isRead}
                ref={messageRef}
            >
                {(shouldShowAvatar && chatboxState!.type === 'PRIVATE') &&
                    <MessageAvatar user={chatboxState!.user} title={chatboxState!.user.nick}/>}
                {(shouldShowAvatar && chatboxState!.type === 'SAVED') &&
                    <MessageAvatar user={self} title={self.nick}/>
                }
                <div className={`bg-[#2e2e2e] flex flex-col whitespace-pre-wrap wrap-break-word
                    rounded-[10px] p-1.25 px-2 w-full break-all ${message.senderId === self.id? 'bg-[#2f2f3f]': ""}`} style={{marginLeft: shouldShowAvatar? '': '25px'}}>
                    {message.content}
                    <div className="flex gap-x-1.25">
                        <p className="text-[12px]" title={formattedTime}>{formattedTime}</p>
                        {isSavedChat && <p className="text-[12px]">✔✔</p>}
                        {(message.senderId === self.id && !isSavedChat) && <p className="text-[12px]">{!!message.isRead? '✔✔':'✓'}</p>}
                    </div>
                </div>
            </li>
        </>
    )
}

export const ChatMessage = memo(MessageComponent)
