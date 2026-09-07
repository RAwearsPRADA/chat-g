'use client'
import defaultAvatar from '@/shared/ui/avatars/default.png'
import { selfChatAvatar } from '@/shared/ui/defaultAvatar'
import Image from 'next/image'
import { useChatboxSwitch } from '@/entities/chatbox/model/hooks/useChatboxSwitch'
import { useBoundStore } from '@/shared/store/store'
import { ISearchedUser } from '@/shared/types/ISearchedItem'
import { ISelfSearched, IUserSearched } from '@/shared/types/ISavedChat'


export const SearchedItem = ({userData}: {userData: ISearchedUser}) => {
    const self = useBoundStore(s => s.self)
    const {switchChatboxWindow} = useChatboxSwitch(self)
    const userAvatar = userData.avatar ?? defaultAvatar
    let chatboxState: ISelfSearched | IUserSearched
    if (userData.nick === self!.nick)
        chatboxState = {type: 'SAVED', searched: true, user: {nick: self!.nick, id: self!.id, avatar: self!.avatar}}
    else
        chatboxState = {type: 'PRIVATE', searched: true, user: {nick: userData.nick, avatar: userData.avatar, id: userData.id}}
    return (
        <>
            <li className="user flex gap-x-1.25 cursor-pointer duration-500 py-1.25 hover:bg-[#0e0000]" onClick={() => {
                switchChatboxWindow(chatboxState)
            }
                }>
                <div className={`relative ${userData.isOnline && self?.id !== userData.id? 
                        "user-online": ''}`}>
                    <Image src={self!.id === userData.id? selfChatAvatar: userAvatar } loading='eager' width={40} height={40} alt="" className='w-auto' />
                </div>
                <div className="grid">
                    <p className="font-bold">{userData.name? userData.name: userData.nick}</p>
                    <div className="user__nick">@{userData.nick}</div>
                    <div className="last__message"></div>
                </div>
            </li>
        </>
    )
}