'use client'

import './styles.css'
import { useEffect, useState } from 'react'
import { SearchedItem } from './User'
import type { User } from '@/app/generated/prisma/client'
import { ISavedChat } from '@/app/api/get_saved_chats/route'
import Image from 'next/image'
import { defaultAvatar, selfChatAvatar } from '@/lib/defaultAvatar'
import { useWebSockets } from '@/lib/websocketProvider/WebSocketProvider'
import { useChatbox } from '../chatBox/chatBoxContext'
import { useChats } from '@/lib/savedChatContext'

function SavedChat({chat, self}: {chat: ISavedChat, self: User}) {
    const {switchChatboxState} = useChatbox()
    const {onlineUsers} = useWebSockets()
    if (chat.type === 'private') {
        if (chat.participants.length) { //в приватных чатах могут быть только 2 пользователя!!!
            const isMemberTyping = (onlineUsers.find(user => user.nick === chat.participants[0].user.nick))?.isTyping
            const chatAvatar = chat.participants[0].user.avatar
            return <>
                <li className='saved__chat' onClick={() => switchChatboxState((chat.participants[0].user as User))}>
                    <div className={`avatar__inner ${onlineUsers.find(user => user.nick === chat.participants[0].user.nick)? 'online': ''}`}>
                        <Image src={chatAvatar? chatAvatar!: defaultAvatar} alt='avatar' loading='eager' height={48} width={48}/>
                    </div>
                    <div className="chat__info">
                        <p className="user__nick">{chat.participants[0].user.nick}</p>
                        {isMemberTyping?
                        <div className="user__typing">
                            <ul>
                                <li className="dot" style={{animation: 'TypingAnimation 0.5s ease-in infinite forwards'}}></li>
                                <li className="dot" style={{animation: 'TypingAnimation 2s ease-in infinite forwards'}}></li>
                                <li className="dot" style={{animation: 'TypingAnimation 4s ease-in infinite forwards'}}></li>
                            </ul>
                            <span>is typing</span>
                        </div>:
                        <div className="last__message">{chat.messages[0].content}</div>
                        }
                    </div>
                </li>
            </>
        }
        if (!!chat.messages[0]) {
            return <>
                <li className='saved__chat' onClick={() => switchChatboxState(self)}>
                    <div className="avatar__inner">
                        <Image src={selfChatAvatar} alt='avatar' loading='eager' width={48} height={48}/>
                    </div>
                    <div className="chat__info">
                        <p className="user__nick">Self</p>
                        <div className="last__message">{chat.messages[0].content}</div>
                    </div>
                </li>
            </>
        }
    }
}


export default function Sidebar({self}: {self: User}) {
    const {savedChats} = useChats()
    const [searchValue, setSearchValue] = useState<string>('')
    const [searchedItems, setSearchedItems] = useState<User[]>([])
    const search = () => { //Поиск по вводу
        const response = fetch('/api/search', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                item: searchValue
            })
        })
    return response
    }
    useEffect(() => {
        if (!searchValue.length) setSearchedItems([])
        const timer = setTimeout(() => {
            if (searchValue.length)
                search().then(data => data.json()).then(response => {
                setSearchedItems(response.searchedItems)
            })
            else { 
                setSearchedItems([])
            }
            }, 1000)
        return () => clearTimeout(timer)
            
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue])
    return (
        <>
            <aside className='sidebar'>
                <div className="sidebar__inner">
                    <div className="search__field">
                        <input type="text" id="search" placeholder='Search' value={searchValue} onChange={(event) => {
                            setSearchValue(event.target.value)
                        }} />
                    </div>
                    <div className="chats__container">
                        <ul className="chats__inner">
                            {searchedItems && (searchedItems.map(item => 
                                    <SearchedItem key={item.nick} self={self} userData={item}/>
                            ))
                            }
                            {(savedChats.length && !searchValue) && savedChats.map(chat => 
                                <SavedChat chat={chat} self={self} key={chat.id}/>
                            )}
                        </ul>
                    </div>
                </div>
            </aside>
        </>
    )
}