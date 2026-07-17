import { searchItem } from "@/features/search-user/searchItem";
import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/shared/lib/validate-token/validateToken";

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