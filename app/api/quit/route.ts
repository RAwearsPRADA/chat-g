import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    console.log(req.cookies)
    if (!!req.cookies.get('token')?.value)
        (await cookies()).set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // ← истекает сразу
    path: '/',
  });
    return NextResponse.json({
        message: "Token was deleted"
    })
}