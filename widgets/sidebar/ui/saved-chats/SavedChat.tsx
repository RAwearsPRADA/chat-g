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
                <li className="w-full min-w-0 flex gap-x-1.25 cursor-pointer duration-500 py-1.25 hover:bg-[#0e0000]" onClick={() => {
                        switchChatboxWindow(chat)
                    }}>
                    <div className={`relative w-14 ${onlineUsers.get(chat.user.nick)? 
                        "user-online": ''}`}>
                        <Image src={chatAvatar? chatAvatar!: defaultAvatar} alt='avatar' loading='eager' height={48} width={48}/>
                    </div>
                    <div className="flex flex-col items-stretch w-full min-w-0">
                        <div className="w-full flex justify-between items-center min-w-0">
                            <p className="truncate">{chat.user.nick}</p>
                            {(!isMemberTyping && !!chat.message.content) &&
                            <p className="shrink-0 text-[#fffddd] text-[14px]">{formatTime(Number(chat.message.createdAt))}</p>}
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
                        <div className="text-[#838383] w-full flex justify-between items-center">
                            {
                                !!chat.message.content.length && 
                                <>
                                    <p className="w-full min-w-0 overflow-hidden truncate">{chat.message.content}</p>
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
        <li className='"w-full min-w-0 flex gap-x-1.25 cursor-pointer duration-500 py-1.25 hover:bg-[#0e0000]' onClick={() => {
            switchChatboxWindow(chat)}}>
            <div className="relative w-14">
                <Image src={selfChatAvatar} alt='avatar' loading='eager' width={48} height={48}/>
            </div>
            <div className="flex flex-col items-stretch w-full min-w-0">
                <div className="w-full flex justify-between items-center min-w-0" style={{display: 'flex', justifyContent: 'space-between'}}>
                    <p className="truncate font-bold">Saved</p>
                    <p className="shrink-0 text-[#fffddd] text-[14px]">{formatTime(Number(chat.message.createdAt))}</p>
                </div>
                <div className="text-[#838383] w-full flex justify-between items-center">
                    <>
                        <p className="w-full min-w-0 overflow-hidden truncate">{chat.message.content}</p>
                    </>
                </div>
            </div>
        </li>
    </>
    }
}