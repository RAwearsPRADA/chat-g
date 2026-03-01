'use client'

import './styles.css'
import { useChatbox } from "./chatBoxContext";
import {useEffect, useState, } from 'react';
import type { IChatMessage } from '@/lib/types/ChatMessage';
import {ChatMessage} from './ChatMessage'
import type { Message, User } from '@/app/generated/prisma/client';
import { ws } from '@/lib/websocket/websocket';
import { useChats } from '@/lib/savedChatContext';


export function Chatbox({self}: {self: User}) {
    const [message, setMessage] = useState<string>('')
    const {updateChatLastMessage} = useChats()
    const {chatboxState, chatHistory, chatId, setChatHistory} = useChatbox()
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
    
    if (!useChatbox()) return;
    const isSelfMessage = (index: number): boolean => {
        const current = chatHistory[index]
        const prev = chatHistory[index - 1]
        if (prev) 
            return !!(prev.senderId === current.senderId)
        return false
    }
    const shouldShowAvatar = (index: number): boolean  => {
        const current = chatHistory[index]
        const next = chatHistory[index + 1]

        return (!next || !(next.senderId === current.senderId)) 
    }

    const sendMessage = () => {
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
                    isRead: false
                }

            }
        })
        updateChatLastMessage({content: message, conversationId: chatId, senderId: self.id, createdAt: new Date().getTime().toString()} )
        const chatMessage: IChatMessage = {content: message, createdAt: new Date().getTime().toString(), receiver: chatboxState, sender: self, conversationId: chatId}
        setMessage('')
        fetch('/api/send_message', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: chatMessage,
            })
        }).then(data => data.json()).then(res => {
            if (chatHistory)
                setChatHistory([...chatHistory, (res.message as Message)])
        })
    }
    if (!chatboxState || !chatHistory) return
    return <>
        <div className="chatbox__container">
            <div className="chatbox__header">
                <div className="member">{chatboxState.name? chatboxState.name: chatboxState.nick}</div>
                <div className="member__last-activity">When was online</div>
            </div>
            <ul className="chatbox__messages-container">
                {chatHistory!.map((message, index) => 
                <ChatMessage key={message.createdAt.toString()} isSelfMessage={isSelfMessage(index)} shouldShowAvatar={shouldShowAvatar(index)} message={message} self={self}/>
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