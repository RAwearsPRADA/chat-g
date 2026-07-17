import { verifyPassword } from "@/shared/lib/hash-password/hashPassword";
import { generateToken } from "@/shared/lib/generate-jwt-token/jwt";
import { sql } from "@/shared/api/db";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";



export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest){
    try {
      const data: {login: string, password: string} = await request.json()

      const [user] = await sql`
        SElECT id, nick, email, password
        FROM "User"
        WHERE "nick" = ${data.login} or "email" = ${data.login}
        LIMIT 1
      `
      if (!user) {
        return NextResponse.json({message: 'Not found', status: false})
      } 

      const isValid = await verifyPassword(data.password, user.password)
      if (!isValid) {
        return NextResponse.json({status: false})
      }

      const token = generateToken(user.nick, user.id)

      const cookieStore = await cookies()
      cookieStore.set({
        name: 'chat-g-token',
        value: token,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 31,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return NextResponse.json({
        status: true,
        data: {
          nick: user.nick,
          email: user.email,
        }
      })
    } catch {
      return NextResponse.json({status: false})
    }
}