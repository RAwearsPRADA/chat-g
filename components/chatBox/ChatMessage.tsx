import Image from "next/image"
import defaultAvatar from '@/public/uploads/avatars/default.png'
import { memo } from "react"
import type { Message, User } from "@/app/generated/prisma/client"
import { useChatbox } from "./chatBoxContext"


function Message({message, self, shouldShowAvatar, isSelfMessage}: {message: Message, self: User, shouldShowAvatar: boolean, isSelfMessage: boolean}) {
    const {chatboxState} = useChatbox()
    return (
        <>
            <li className={`chat__message ${isSelfMessage? 'same-sender__message': ''}`}>
                {shouldShowAvatar &&
                    <Image src={self.avatar? self.avatar: defaultAvatar} alt='avatar' width={20} title={`${self.id === message.senderId? self.nick: chatboxState.nick}`} />}
                <div className={`message__text ${message.senderId === self.id? 'self': ""}`} style={{marginLeft: shouldShowAvatar? '': '25px'}}>
                    {message.content}
                    <p className="message__date" title={message.createdAt.toString()}>{message.createdAt.toString().slice(11, 16)}</p>
                </div>
            </li>
        </>
    )
}

export const ChatMessage = memo(Message)
