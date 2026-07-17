import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ 
    path: path.resolve(process.cwd(), '.env') 
})

import type { Request } from '@/shared/api/types/requests'
import type { ChatWebSocket } from './types/ChatWebSocket'
import crypto from 'crypto'
import App from 'uWebSockets.js' 
import Redis from 'ioredis'

type CustomWebSocket = App.WebSocket<ChatWebSocket>

const usersSockets = new Map<number, Set<CustomWebSocket>>()
const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.1.55', 
    port: Number(process.env.REDIS_PORT) || 6379
})  

const subRedis = new Redis({
    host: process.env.REDIS_HOST || '127.0.1.55',
    port: Number(process.env.REDIS_PORT) || 6379
})

subRedis.subscribe('chat:created')

redis.on('connect', () => {
    console.log('✅ REDIS ПОДКЛЮЧЕН УСПЕШНО')
})

const server = App.App()

server.ws('/*', {
    compression: App.DISABLED,
    maxPayloadLength: 1024 * 10,
    idleTimeout: 60,

    upgrade: (res, req, context) => {
        let isAborted = false
        res.onAborted(() => { isAborted = true })

        const queryString = req.getQuery()
        const params = new URLSearchParams(queryString)
        const ticket = params.get('ticket')

        if (!ticket){
            res.writeStatus('401').end('Ticket is missing')
            return
        }
        const [payload, signature] = ticket.split('-')
        const [nick, id, expiresAt] = payload.split(':')
        if (Date.now() > Number(expiresAt)) {
            res.writeStatus('402').end('Ticket out of time')
            return
        }
        const exprectedSignature = crypto.createHmac('sha256', process.env.WS_SECRET!).update(`${nick}:${id}:${expiresAt}`).digest('hex')
        const isSignatureValid = exprectedSignature === signature
        if (!isSignatureValid) {
            res.writeStatus('402 Bad request').end('Data is missing')
            return
        }
        if (isAborted){
            return
        }
        res.upgrade({
            nick: nick,
            id: Number(id),
            chats: new Set<number>(),
            isClosed: false
        } satisfies ChatWebSocket,
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        context)
    },

    open: async (ws: CustomWebSocket) => {
        const user = ws.getUserData()
        if (!usersSockets.has(user.id))
            usersSockets.set(user.id, new Set())
        usersSockets.get(user.id)!.add(ws)
        if (usersSockets.get(user.id)!.size === 1)
            redis.sadd(`users:online`, user.nick)
        ws.subscribe(`user:${user.id}`)
        const data = await redis.smembers(`user:${user.id}:chats`)
        if (!data || !data.length)
            return
        const chats = data.map(Number)
        const notification = JSON.stringify({
            type: 'new user connected',
            data: {nick: user.nick}
        })
        const participantsKeys: string[] = []
        chats.forEach(chatId => {
            user.chats.add(chatId)
            ws.subscribe(`chat:${chatId}`)
            ws.publish(`chat:${chatId}`, notification, false, false)
            participantsKeys.push(`chat:${chatId}:members`)
        })
        if (user.isClosed)
            return
        
        const siblingsNicks = await redis.sunion(...participantsKeys) as string[]
        const siblingsNicksArray = siblingsNicks.filter(nick => nick !== user.nick) //filtering from user's nick
        if (!siblingsNicksArray.length) 
            return

        const onlineStatuses = await redis.call('SMISMEMBER', 'users:online', ...siblingsNicksArray) as number[]
        const siblingsOnline = siblingsNicksArray.filter((_, index) => onlineStatuses[index] === 1)
        ws.send(JSON.stringify({
            type: 'online users',
            data: {onlineUsers: siblingsOnline}
        }))
    },

    message: async (ws: CustomWebSocket, msg, isBinary) => {
        if (msg.byteLength === 0) return
            try {
            const user = ws.getUserData()
            const dataStr = new TextDecoder().decode(msg)
            if (!dataStr || user.id === 0)
                 return ws.close()
            const message: Request = JSON.parse(dataStr)
            const targetChat = message.data.messageTarget
            if (targetChat === 0) 
                return
            if (message.type === 'new message') {
                if (message.data.user.nick !== user.nick)
                    return
                if (!user.chats.has(targetChat)) {
                    return
                }
                ws.publish(`chat:${targetChat}`, dataStr, false, false)
                return
            }
            if (!('messageTarget' in message.data) || !user.chats.has(message.data.messageTarget)) 
                return
            
            if ('nick' in message.data && message.data.nick !== user.nick)
                return
            
            if (message.type === 'typing') {
                ws.publish(`chat:${targetChat}`, dataStr, false, false)
                return
            }

            if (message.type === 'recording message') {
                ws.publish(`chat:${targetChat}`, dataStr, false, false)
                return
            }
            if (message.type === 'listening own voice message') {
                ws.publish(`chat:${targetChat}`, dataStr, false, false)
                return
            }
            if (message.type === 'removed voice message') {
                ws.publish(`chat:${targetChat}`, dataStr, false, false)
                return
            }
            if (message.type === 'sending voice message') {
                ws.publish(`chat:${targetChat}`, dataStr, false, false)
                return
            }
            } catch {
                return
            }    },

    close: (ws: CustomWebSocket) => {
        const user = ws.getUserData()
        user.isClosed = true        
        const userSockets = usersSockets.get(user.id)
        if (userSockets) {
            userSockets.delete(ws)

            if (userSockets.size === 0) {
                usersSockets.delete(user.id)
                redis.srem('users:online', user.nick)
                const disconnectionNotification = JSON.stringify({
                    type: "user disconnected",
                    data: { nick: user.nick }
                })
                user.chats.forEach(chatId => {
                    server.publish(`chat:${chatId}`, disconnectionNotification, false, false)
                })
            }
        }
    }
})

redis.del('users:online').catch(() => {})

subRedis.on('message', (channel, message) => {
    if (channel === 'chat:created') {
        try {
            const {chatId, participantsIds} = JSON.parse(message) as {type: string, chatId: number, participantsIds: number[]}
            console.log(participantsIds)
            participantsIds.forEach(userId => {
                const userSockets = usersSockets.get(userId)
                if (userSockets) {
                    userSockets.forEach(socket => {
                        const userData = socket.getUserData()
                        socket.subscribe(`chat:${chatId}`)
                        userData.chats.add(chatId)
                    })
                }
                })
            } catch { }
    }
})

server.listen(2379, (token) => {
    if (token) console.log('🚀Server started on port 2379')
    else console.error('❌ This port is unavailable!')
})
