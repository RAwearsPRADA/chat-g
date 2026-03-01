import { NextRequest, NextResponse } from "next/server"
import { urlFilter } from "./lib/filterURLs/filter"

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()
    if (urlFilter(request.nextUrl.pathname)) {
        response.headers.set('x-current-path', request.nextUrl.pathname)
        return response
    }
    return response
}

export const runtime = 'nodejs'
