'use client'

import './styles.css'
import { useChatbox } from "./chatBoxContext";
import {useEffect, useState, } from 'react';
import {ChatMessage} from './ChatMessage'
import type { User } from '@/app/generated/prisma/client';
import { ws } from '@/lib/websocket/websocket';
import { useChats } from '@/lib/savedChatContext';


export function Chatbox({self}: {self: User}) {
    const [message, setMessage] = useState<string>('')
    const {updateChatLastMessage} = useChats()
    const {chatboxState, chatId, chatsCache, setChatsCache} = useChatbox()
    const currentChat = chatsCache.find(chat => chat.chatId === chatId)
    useEffect(() => {
        ws.send({
            type: 'typing',
            data: {
                nick: self.nick,
                messageTarget: chatId,
                isTyping: true,
            }
        })
        const timer = setTimeout(() => ws.send({
            type: 'typing',
            data: {
                nick: self.nick,
                messageTarget: chatId,
                isTyping: false
            }
        }), 1500)
        return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message])
    const chatbox = useChatbox()
    if (!chatbox) return;
    const isTheSameAuthor = (index: number): boolean => {
        const current = currentChat?.chatHistory[index]
        const prev = currentChat?.chatHistory[index - 1]
        if (prev) 
            return !!(prev.senderId === current!.senderId)
        return false
    }
    const shouldShowAvatar = (index: number): boolean  => {
        const current = currentChat?.chatHistory[index]
        const next = currentChat?.chatHistory[index + 1]

        return (!next || !(next.senderId === current!.senderId)) 
    }

    const sendMessage = () => {
        const sendingMessage = {content: message, conversationId: chatId, senderId: self.id, createdAt: new Date(), isRead: false}
        updateChatLastMessage(sendingMessage)
        setChatsCache(prev => {
            const updated = prev
            const index = updated.findIndex(chat => chat.chatId === chatId)
            updated[index].chatHistory = [...updated[index].chatHistory, {content: sendingMessage.content, conversationId: chatId, createdAt: new Date(), isRead: false, senderId: self.id}]
            return updated
        })
        ws.send({
            type: 'new message',
            data: {
                nick: self.nick,
                messageTarget: chatId,
                isTyping: false,
                message: {
                    content: message, 
                    conversationId: chatId,
                    senderId: self.id,
                    isRead: false,
                    createdAt: sendingMessage.createdAt
                }

            }
        })
        setMessage('')
        fetch('/api/send_message', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: sendingMessage,
            })
        }).then(data => data.json()).then(res => {
            console.log(res)
        })
    }
    if (!chatboxState || !currentChat) return
    if ('nick' in chatboxState)
        return <>
            <div className="chatbox__container">
                <div className="chatbox__header">
                    <div className="member">{chatboxState.name? chatboxState.name: chatboxState.nick}</div>
                    <div className="member__last-activity">When was online</div>
                </div>
                <ul className="chatbox__messages-container">
                    {chatsCache.find(chat => chat.chatId === chatId)?.chatHistory.map((message, index) => 
                        <ChatMessage key={message.createdAt.toString()} isSelfMessage={isTheSameAuthor(index)} shouldShowAvatar={shouldShowAvatar(index)} message={message} self={self}/>
                    )}
                </ul>
                <div className="chatbox__input-field">
                    <input type="text" id="message" placeholder='Type message' value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => {
                        if (event.key === 'Enter' && !!message.length && message !== ' ') {
                            sendMessage()

                        }
                    }}/>
                    <button className={`send__message-btn ${message.trim()? 'active': ''}`} title='Send messge' onClick={() => {
                        if (!!message.length && message !== ' '){
                            sendMessage()
                        }
                    }}>✉️</button>
                </div>
            </div>
        </>
    return <>
    <div className="chatbox__container">
        <div className="chatbox__header">
            <div className="member">{chatboxState.title}</div>
            <div className="member__last-activity">When was online</div>
        </div>
        <ul className="chatbox__messages-container">
            {currentChat!.chatHistory.map((message, index) => 
            <ChatMessage key={message.createdAt.toString()} isSelfMessage={isTheSameAuthor(index)} shouldShowAvatar={shouldShowAvatar(index)} message={message} self={self}/>
            )}
        </ul>
        <div className="chatbox__input-field">
            <input type="text" id="message" placeholder='Type message' value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => {
                if (event.key === 'Enter' && !!message.length && message !== ' ') {
                    sendMessage()

                }
            }}/>
            <button className={`send__message-btn ${message.trim()? 'active': ''}`} title='Send messge' onClick={() => {
                if (!!message.length && message !== ' '){
                    sendMessage()
                }
            }}>✉️</button>
        </div>
    </div>
</>
}