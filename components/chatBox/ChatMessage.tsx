import Image from "next/image"
import defaultAvatar from '@/public/uploads/avatars/default.png'
import { memo } from "react"
import type { Message, User } from "@/app/generated/prisma/client"
import { useChatbox } from "./chatBoxContext"


function Message({message, self, shouldShowAvatar, isSelfMessage}: {message: Omit<Message, 'id'>, self: User, shouldShowAvatar: boolean, isSelfMessage: boolean}) {
    const {chatboxState} = useChatbox()
    if ('nick' in chatboxState!)
        return (
            <>
                <li className={`chat__message ${isSelfMessage? 'same-sender__message': ''}`}>
                    {shouldShowAvatar &&
                        <Image src={self.avatar? self.avatar: defaultAvatar} alt='avatar' width={20} title={`${self.id === message.senderId? self.nick: chatboxState.nick}`} />}
                    <div className={`message__text ${message.senderId === self.id? 'self': ""}`} style={{marginLeft: shouldShowAvatar? '': '25px'}}>
                        {message.content}
                        <p className="message__date" title={message.createdAt.toString()}>{new Date(message.createdAt.toString()).toString().split(' ')[4].slice(0, 5)}</p>
                    </div>
                </li>
            </>
        )
    else {
        console.error('Do it balya(я про общие чаты если чо)')
    }
}

export const ChatMessage = memo(Message)
