import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    await prisma.user.deleteMany({})
    return NextResponse.json({
        message: 'Success'
    })
}