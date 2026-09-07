import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'

export async function validateToken() {
    const token = (await cookies()).get('chat-g-token')?.value
    if (!token) return null
    else {
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {nick: string, id: number}
            const nick = decoded.nick
            const id = decoded.id
            return {nick, id}
        }
        catch {
            return null
        }
    }
}