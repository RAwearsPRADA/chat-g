'use client'
import defaultAvatar from '@/public/uploads/avatars/default.png'
import type { User } from '@/app/generated/prisma/client'
import Image from 'next/image'
import { useChatbox } from '../chatBox/chatBoxContext'
import { useWebSockets } from '@/lib/websocketProvider/WebSocketProvider'
import { selfChatAvatar } from '@/lib/defaultAvatar'

export const SearchedItem = ({userData, self}: {userData: User, self: User}) => {
    const {onlineUsers} = useWebSockets()
    const {switchChatboxState} = useChatbox()
    if (userData.nick !== self.nick)
        return (
            <>
                <li className="user chat__item" onClick={() => {
                    switchChatboxState(userData)
                }}>
                    <div className={`avatar__inner ${!!onlineUsers.find(user => user.nick === userData.nick)? 'online': ''}`}>
                        <Image src={userData.avatar? userData.avatar: defaultAvatar} loading='eager' width={40} height={40} alt="" className='user__avatar' />
                    </div>
                    <div className="chat__item-container">
                        <p className="user__name">{userData.name? userData.name: userData.nick}</p>
                        <div className="user__nick">@{userData.nick}</div>
                        <div className="last__message"></div>
                    </div>



                </li>
            </>
        )
    else
    return (
        <li className='saved__chat' onClick={() => switchChatboxState(self)}>
            <div className="avatar__inner">
                <Image src={selfChatAvatar} alt='avatar' loading='eager' width={48} height={48}/>
            </div>
            <div className="chat__info">
                <p className="user__nick">Self</p>
            </div>
        </li>)
}