import {prisma} from '@/lib/prisma'

export async function searchGeneralChat(firstUserName: string, secondUserName: string) {
    const chats = await prisma.conversation.findMany()
    
}