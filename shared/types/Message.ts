export interface Message {
    id: number,
    content: string,
    senderId: number,
    conversationId: number,
    isRead: boolean,
    createdAt: number,
    type: 'TEXT' | 'VOICE' | 'ATTACHMENT' | 'FORWARDED'
}