import type {ILastMessage, ISavedChat } from "@/shared/types/ISavedChat"
import type { User } from "@/shared/types/User"
import { IProfile } from "@/shared/types/IProfile"
import { sql } from "@/shared/api/db"
import { redis } from "@/shared/api/redis"
import ProfileClient from "./ProfileClient"
import Header from "@/widgets/header/Header"
import crypto from 'node:crypto'

export default async function Profile({token}: {token: {nick: string, id: number}}) {
    await redis.srem(`user:${token.id}:chats`, "")
    const results = await redis.pipeline().
      hgetall(`user:${token.id}`).
      smembers(`user:${token.id}:chats`).
      exec()
    let selfInfo: User
    if (!results)
      return
    const [[, cachedUser], [, chatsCache]] = results as [
      [Error | null, Record<string, string>],
      [Error | null, string[] | null]
    ]
    if (!cachedUser || Object.keys(cachedUser).length === 0) {
      const [info] = await sql<User[]>`
        SELECT "nick", "name", "email", "avatar", "id" FROM "User"
        WHERE "id" = ${token.id}
      `
      selfInfo = info
      redis.hset(`user:${token.id}`, info)
    } else {
      selfInfo = cachedUser as unknown as User
    }
    let filtered: ISavedChat[] = []
    const payload = `${token.nick}:${token.id}:${Date.now() + 31 * 24 * 3600 * 1000}`
    const signature = crypto.createHmac('sha256', process.env.WS_SECRET!).update(payload).digest('hex')
    const wsTicket = `${payload}-${signature}`
    if (chatsCache && chatsCache.length > 0) {
      try {
        const chatIds = chatsCache.map(Number)
        if (chatIds.length > 0) {
          const savedChats = await sql<
          {conversationId: number, userId: number, lastMessageContent: string, 
              lastMessageSenderId: number, lastMessageTime: number, lastMessageType: 'TEXT'| 'VOICE' | 'FORWARDED' | 'ATTACHMENT', 
              lastMessageIsRead: boolean, conversationType: 'SAVED' | 'PRIVATE' | 'GROUP' | 'CHANNEL', 
              conversationAvatar: string, conversationTitle: string
          }[]>`
           SELECT * FROM "ConversationParticipant" cp
          WHERE cp."conversationId" = ANY(${chatsCache.map(Number)})
            AND cp."lastMessageContent" IS NOT NULL
            AND cp."conversationType" = 'PRIVATE'
            AND cp."userId" != ${token.id}
                  
          UNION ALL
                  
          SELECT * FROM "ConversationParticipant" cp
          WHERE cp."conversationId" = ANY(${chatsCache.map(Number)})
            AND cp."lastMessageContent" IS NOT NULL
            AND cp."conversationType" = 'SAVED'
          `;
          const pipeline = redis.pipeline()
          savedChats.forEach(chat => {
            if (chat.conversationType === 'PRIVATE')
              pipeline.hgetall(`user:${chat.userId}`)
            else
              pipeline.ping()
          })
          const profiles = (await pipeline.exec())?.map(([, data]) => data) as IProfile[] | "PONG"
          if (!profiles)
            return
          filtered = savedChats.map((chat, index): ISavedChat => {
            const mainPart: {chatId: number, message: ILastMessage}= {
                  chatId: chat.conversationId,
                  message: {
                    content: chat.lastMessageContent,
                    createdAt: chat.lastMessageTime,
                    type: chat.lastMessageType,
                    isRead: chat.lastMessageIsRead,
                    senderId: chat.lastMessageSenderId
                  },
            }
            switch (chat.conversationType) {
              case 'SAVED':
                return {
                  ...mainPart,
                  user: {
                    nick: (profiles[index] as IProfile).nick,
                    avatar: (profiles[index] as IProfile).avatar,
                    id: Number((profiles[index] as IProfile).id)
                  },
                  type: chat.conversationType
                }
              case 'PRIVATE':
                return {
                  ...mainPart,
                  type: 'PRIVATE',
                  user: {
                    avatar: (profiles[index] as IProfile).avatar,
                    nick: (profiles[index] as IProfile).nick,
                    id: Number((profiles[index] as IProfile).id)
                  }
                }
              case 'CHANNEL':
                return {
                  ...mainPart,
                  type: 'CHANNEL',
                  chatAvatar: chat.conversationAvatar,
                  chatTitle: chat.conversationTitle,
                } 
              case 'GROUP':
                return {
                  ...mainPart,
                  chatAvatar: chat.conversationAvatar,
                  chatTitle: chat.conversationTitle,
                  type: 'GROUP'
                }
            }
          })
        }
      } catch (error){ console.log(error)}
    } 
    selfInfo = {...selfInfo, id: token.id}
    return (
    <>
      <Header/>
      <ProfileClient filtered={filtered} selfInfo={selfInfo!} wsTicket={wsTicket}/>
    </>
)
}