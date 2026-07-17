'use client'
import defaultAvatar from '@/shared/ui/avatars/default.png'
import { selfChatAvatar } from '@/shared/ui/defaultAvatar'
import Image from 'next/image'
import { useChatboxSwitch } from '@/entities/chatbox/model/hooks/useChatboxSwitch'
import { useBoundStore } from '@/shared/store/store'
import { ISearchedUser } from '@/shared/types/ISearchedItem'
import { ISelfSeached, IUserSearched } from '@/shared/types/ISavedChat'


export const SearchedItem = ({userData}: {userData: ISearchedUser}) => {
    const self = useBoundStore(s => s.self)
    const {switchChatboxWindow} = useChatboxSwitch(self)
    const userAvatar = userData.avatar ?? defaultAvatar
    let chatboxState: ISelfSeached | IUserSearched
    if (userData.nick === self!.nick)
        chatboxState = {type: 'SAVED', searched: true, user: {nick: self!.nick, id: self!.id, avatar: self!.avatar}}
    else
        chatboxState = {type: 'PRIVATE', searched: true, user: {nick: userData.nick, avatar: userData.avatar, id: userData.id}}
    return (
        <>
            <li className="user chat__item" onClick={() => {
                switchChatboxWindow(chatboxState)
            }
                }>
                <div className={`avatar__inner ${userData.isOnline && self?.id !== userData.id? 'online': ''}`}>
                    <Image src={self!.id === userData.id? selfChatAvatar: userAvatar } loading='eager' width={40} height={40} alt="" className='user__avatar' />
                </div>
                <div className="chat__item-container">
                    <p className="user__name">{userData.name? userData.name: userData.nick}</p>
                    <div className="user__nick">@{userData.nick}</div>
                    <div className="last__message"></div>
                </div>
            </li>
        </>
    )
}