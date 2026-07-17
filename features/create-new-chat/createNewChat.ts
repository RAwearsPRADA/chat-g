import type { chatType } from "@/shared/types/chatType";

export async function createNewChat(firstUserId: number, secondUserId: number, type: chatType) {
    const request = await fetch("/api/create_new_chat", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstUserId,
            secondUserId,
            type
        })
    })
    const response: {chat: {id: number, type: chatType}} = await request.json()
    if (response.chat) {
        return response
    }
    return null
}