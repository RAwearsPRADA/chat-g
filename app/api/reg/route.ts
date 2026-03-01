import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { IUser } from "@/lib/types/IUser";
import { validateData } from "@/lib/validators/reg";
import { hashPassword } from "@/lib/hashPassword/hashPassword";


export async function POST(request: NextRequest) {
    const {nick, email, password}: IUser = await request.json()
    const existingUsers: Omit<IUser, 'password'>[] = await prisma.user.findMany({
        select: {
            nick: true,
            email: true,
        }
    })
    const errorType = validateData({nick, email, password}, existingUsers)
    if (!!errorType)
        return NextResponse.json({
            status: false,
            errorType
        })
    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
        data: {
            nick,
            email,
            password: hashedPassword,
        }
    })
    return NextResponse.json({
        status: true
    })
    
}

export default interface IResponse {
    status: boolean,
    errorType?: string
}