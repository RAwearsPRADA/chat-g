import { prisma } from "../prisma";

export async function searchItem(itemName: string) {
    if (!itemName.trim()) return;
    if (itemName.startsWith('@')) {
        const searchItem = itemName.slice(1)
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nick: true,
                avatar: true,
                messages: true,
                conversations: true,
                name: true
            },
            where: {
                OR: [
                    {nick: {
                        startsWith: searchItem
                    }},
                    {nick: {
                        contains: searchItem,
                        mode: 'insensitive'
                    }},
                    {email: {
                        startsWith: searchItem
                    }},
                    {email: {
                        contains: searchItem,
                        mode: 'insensitive'
                    }},
                    
                ]
            }
        })
        return users
    }
    return null
}