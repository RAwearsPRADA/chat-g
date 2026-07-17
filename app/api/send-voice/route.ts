import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from 'fs/promises'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        const file = formData.get('voice') as File | null

        if (!file)
            return NextResponse.json({error: 'No audio was found'}, {status: 401})
        
        const bytes = await file.arrayBuffer()
        const butter = Buffer.from(bytes)

        const uniqueId = crypto.randomUUID()
        const fileName = `${uniqueId}.webm`
        
        const uploadDir = path
    } catch {}
}