import { verifyPassword } from "@/lib/hashPassword/hashPassword";
import { generateToken } from "@/lib/JWT/jwt";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const data: {login: string, password: string} = await request.json()
    const user = await prisma.user.findFirst({
    where: {
      OR: [
        { nick: data.login },
        { email: data.login }
      ]
    },
    select: {
      nick: true,
      email: true,
      password: true,
      
    }
  });
  if (!user) return NextResponse.json({
    message: 'Not found',
    status: false
  })
  const isValid = await verifyPassword(data.password, user.password)
  if (!isValid) return NextResponse.json({
    status: false
  })
  const token = generateToken(user.nick, user.email);
  (await cookies()).set({
    name: 'token',
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
        email: user.email
    }
  })
}