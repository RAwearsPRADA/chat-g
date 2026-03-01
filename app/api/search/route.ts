import { searchItem } from "@/lib/searchItem/searchItem";
import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "../me/route";

export async function POST(request: NextRequest) {
    const token = await validateToken()
    const {item} = await request.json()
    const searchResults = await searchItem(item)
    
    return NextResponse.json({
        searchedItems: searchResults?.map(item => {
            if (item.nick === token?.nick) return {...item, name: 'You'}
            return item
        })
    })
}