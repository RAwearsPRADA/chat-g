import { NextResponse } from "next/server";
import { validateToken } from "../me/route";
import JWT from 'jsonwebtoken'

export async function GET() {
    const token = await validateToken()
    if (!token)
        return NextResponse.json({
            error: 'Unauthorized'
        },
         {status: 401})
    const wsToken = await JWT.sign(
        {nick: token.nick, email: token.email},
        process.env.JWT_SECRET!,
        {expiresIn: '120s'}
    )
    return NextResponse.json({
        token: wsToken
    })
}