import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTPayload } from "@/lib/JWT/JWTPayload";
import jwt from 'jsonwebtoken'
import { prisma } from "@/lib/prisma";
import { User } from "@/app/generated/prisma/client";

export async function validateToken() {
    const token = (await cookies()).get('token')?.value
    if (!token) return null
    else {
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
            const nick = decoded.nick
            const email = decoded.email
            return {nick, email}
        }
        catch {
            return null
        }
    }
}

export async function GET() {
    const token = await validateToken()
    if (!token) return NextResponse.json({
        status: false
    }, {status: 401})
    const user = await prisma.user.findFirst({
        select: {
            nick: true,
            conversations: true,
            messages: true
        },
        where: {
            nick: token?.nick
        }
    })
    if (!!token) return NextResponse.json({
        data: user,
        status: true
    })
}

export interface IResponse {
    status: boolean
    data?: User
}
