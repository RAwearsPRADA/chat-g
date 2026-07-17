import type { User } from "@/shared/types/User";
import { redis } from "@/shared/api/redis";
import { sql } from "@/shared/api/db";

export async function searchItem(itemName: string) {
    if (!itemName.trim()) return;
    if (itemName.startsWith('@')) {
        const searchItem = itemName.slice(1)
        const users = await sql<User[]>`
            SELECT * FROM "User"
            WHERE LOWER("nick") LIKE LOWER(${searchItem}) || '%'
            LIMIT 20
        `
        
        if (users.length === 0) 
            return []
        
        const pipeline = redis.pipeline()

        users.forEach(user => {
            pipeline.sismember('users:online', user.nick)
        })

        const pipelineResults = await pipeline.exec()

        const onlineUsers = users.map((user, index) => {
            const [error, isOnline] = pipelineResults? pipelineResults[index]: [null, 0] 

            return {
                ...user,
                isOnline: !error && isOnline === 1
            }
        })
        return onlineUsers
    }
    return null
}