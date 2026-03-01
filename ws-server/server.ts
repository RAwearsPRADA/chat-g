import dotenv from 'dotenv'

dotenv.config()


import WebSocket, {WebSocketServer} from 'ws'
import { ObjectsArray } from '@/lib/ObjectsArray'
import type {IWebSocketAPI} from '@/lib/types/WebSocketAPI'
import type { IUser } from '@/lib/types/WebSocketUser'
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { IData } from '@/lib/websocket/websocket'

const users = new ObjectsArray<IUser>(['nick'])
users.getObjects()
const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg({connectionString})
const prisma = new PrismaClient({adapter})


const wss = new WebSocketServer({port: 8080})


function broadcast(data: IWebSocketAPI) {
    const message: IData = typeof data === 'string'? JSON.parse(data): data
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            if (message.type === 'online users' || message.type === 'offline user')
                client.send(JSON.stringify({
                    type: message.type,
                    data: {
                        onlineUsers: users.getObjects()
                    }
                }))
        }
    })
}

wss.on('connection', async (ws) => {
    let userNick: string | null = null
    ws.on('message', async (data) => {
        const message: IWebSocketAPI = JSON.parse(data.toString())
        if (message.type === 'auth') {
            userNick = message.data.nick!
            users.add({isTyping: false, nick: userNick, typingTarget: null, ws: ws})
            broadcast({
                type: 'online users',
                data: {
                    onlineUsers: users.getObjects()
                }
            })
        }
        if (message.type === 'disconnect') {
            users.delete('nick', message.data.nick!)
            broadcast({
                type: 'online users',
                data: {
                    onlineUsers: users.getObjects()
                }
            })
        }
        if (message.type === 'typing') {
            const query = await prisma.conversation.findFirst({
                select: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    nick: true
                                }
                            }
                        }
                    }
                },
                where: {
                    id: message.data.messageTarget!
                },
                
                })
            const chatMembers = query?.participants.filter(member => member.user.nick !== message.data.nick)
            chatMembers?.forEach(member => {
                users.getObjects().find(user => user.nick === member.user.nick)?.ws.send(JSON.stringify({
                    type: 'typing',
                    data: {
                        nick: message.data.nick,
                        messageTarget: message.data.messageTarget,
                        isTyping: message.data.isTyping,
                    }
                }))
            })
            
        }
        if (message.type === 'new message') {
            const query = await prisma.conversation.findFirst({
                select: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    nick: true
                                }
                            }
                        }
                    }
                },
                where: {
                    id: message.data.messageTarget!
                },
                })
                const chatMembers = query?.participants.filter(member => member.user.nick !== message.data.nick)
                chatMembers?.forEach(member => {
                    users.getObjects().find(user => user.nick === member.user.nick)?.ws.send(JSON.stringify({
                        type: 'new message',
                        data: message.data
                    }))
                })
        }
        })
    ws.on('close', () => {
        if (userNick) {
            users.deleteByObject({nick: userNick})
            broadcast({
                type: 'online users',
                data: {
                    onlineUsers: users.getObjects()
                }
            })
        }
    })
})

console.log('WSS server started on ws://localhost:8080')
