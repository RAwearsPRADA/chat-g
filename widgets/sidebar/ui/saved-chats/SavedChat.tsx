'use client'

import type { ISavedChat } from "@/shared/types/ISavedChat"
import Image from "next/image"
import { UserTyping } from "@/features/user-status/UserTyping"
import { defaultAvatar, selfChatAvatar } from "@/shared/ui/defaultAvatar"
import { useChatboxSwitch } from "@/entities/chatbox/model/hooks/useChatboxSwitch"
import { useBoundStore } from "@/shared/store/store"
import { UserRecordingVoice } from "@/features/user-status/UserRecordingVoice"
import { UserListeningOwnVoice } from "@/features/user-status/UserListeningOwnVoice"
import { formatTime } from "@/shared/lib/format-time/formatTime"

export function SavedChat({chat}: {chat: ISavedChat}) {
    const self = useBoundStore(s => s.self)
    const {switchChatboxWindow} = useChatboxSwitch(self)
    const onlineUsers = useBoundStore(s => s.onlineUsers)
    console.log(chat.message)
    if (!self)
        return
    if (chat.type === 'PRIVATE') {
        if (chat.user) { //private chats can contain only two users
            const isThisChat = onlineUsers.get(chat.user.nick)?.actionTarget === chat.chatId
            const isMemberTyping = (onlineUsers.get(chat.user.nick)?.isTyping && isThisChat)
            const isMemberRecording = (onlineUsers.get(chat.user.nick)?.isRecording && isThisChat)
            const isListeningOwnVoice = (onlineUsers.get(chat.user.nick)?.isListeningOwnAudio)
            const nothingDoing = (!isMemberRecording && !isMemberTyping && !isListeningOwnVoice)
            const chatAvatar = chat.user.avatar
            return <>
                <li className='saved__chat' onClick={() => {
                        switchChatboxWindow(chat)
                    }}>
                    <div className={`avatar__inner ${onlineUsers.get(chat.user.nick)? 'online': ''}`}>
                        <Image src={chatAvatar? chatAvatar!: defaultAvatar} alt='avatar' loading='eager' height={48} width={48}/>
                    </div>
                    <div className="chat__info">
                        <div className="info__inner" style={{display: 'flex', justifyContent: 'space-between'}}>
                            <p className="user__nick">{chat.user.nick}</p>
                            {(!isMemberTyping && !!chat.message.content) &&
                            <p className="last__message-time" style={{color: '#fffddd', fontSize: '14px'}}>{formatTime(Number(chat.message.createdAt))}</p>}
                        </div>
                        {isMemberTyping &&
                            <UserTyping/>
                        }
                        {isMemberRecording &&
                            <UserRecordingVoice/>
                        }
                        {isListeningOwnVoice &&
                            <UserListeningOwnVoice/>
                        }
                        {(nothingDoing) && 
                        <div className="last__message" style={{display: 'flex', justifyContent: 'space-between',width: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {
                                !!chat.message.content.length && 
                                <>
                                    <p className="last__message-text">{chat.message.content}</p>
                                    {chat.message.senderId === self.id && <span className={`is-read ${chat.message.isRead?'text-blue-400': ''}`}>{chat.message.isRead? '✓✓': '✓'}</span>}
                                </>
                            }
                        </div>}
                    
                    </div>
                </li>
            </>
        }
    }
    if (!!chat.message) {
    return <>
        <li className='saved__chat' onClick={() => {
            switchChatboxWindow(chat)}}>
            <div className="avatar__inner">
                <Image src={selfChatAvatar} alt='avatar' loading='eager' width={48} height={48}/>
            </div>
            <div className="chat__info">
                <div className="info__inner" style={{display: 'flex', justifyContent: 'space-between'}}>
                    <p className="user__nick">Saved</p>
                    <p className="last__message-time" style={{color: '#fffddd', fontSize: '14px'}}>{formatTime(Number(chat.message.createdAt))}</p>
                </div>
                <div className="last__message" style={{display: 'flex', justifyContent: 'space-between',width: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    <>
                        <p className="last__message-text">{chat.message.content}</p>
                    </>
                </div>
            </div>
        </li>
    </>
    }
}