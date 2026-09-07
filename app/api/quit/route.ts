import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    console.log(req.cookies)
    if (!!req.cookies.get('chat-g-token')?.value)
        (await cookies()).set('chat-g-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, 
    path: '/',
  });
    return NextResponse.json({
        message: "Token was deleted"
    })
}