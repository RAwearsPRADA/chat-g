import type { IUser } from "@/shared/types/IUser";
import { NextResponse, NextRequest } from "next/server";
import { sql } from "@/shared/api/db";
import { validateData } from "@/shared/lib/validators/reg";
import { hashPassword } from "@/shared/lib/hash-password/hashPassword";
import { redis } from "@/shared/api/redis";

export async function POST(request: NextRequest) {
    try {
        const createdAt = Date.now()
        const {nick, email, password}: IUser = await request.json()
        const isUserExist = await sql`
            SELECT nick, email
            FROM "User"
            WHERE "nick" = ${nick} OR "email" = ${email}
            LIMIT 1 
        `;

        const errorType = validateData({nick, email, password}, isUserExist as unknown as Omit<IUser, "password">[])
        if (errorType) {
            return NextResponse.json({status: false, errorType})
        }
        
        const hashedPassword = await hashPassword(password)

        const [user] = await sql<{id: number, nick: string, email: string}[]>`
            INSERT INTO "User" ("nick", "email", "password", "createdAt")
            VALUES (${nick}, ${email}, ${hashedPassword}, ${createdAt})
            RETURNING "id", "nick", "email"
        `
        await redis.hset(`user:${user.id}`, {
            nick: user.nick,
            email: user.email,
            avatar: '',
            name: ''
        })
        return NextResponse.json({status: true})
    } catch (error) {
        console.log(error)
        return NextResponse.json({status: false}, {status: 500})
    }
}

export type RegReturnType = {status: boolean, errorType?: string}