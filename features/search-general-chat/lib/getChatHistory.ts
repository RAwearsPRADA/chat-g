import { Message } from "@/shared/types/Message"

export async function getChatHistory(chatId: number): Promise<{chatHistory: Message[]}> {
    const response = await fetch('/api/get_chat_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chatId
        })
    })
    const data = await response.json()
    return data
}