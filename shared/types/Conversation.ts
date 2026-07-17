export interface Conversation {
    id: number,
    type: "SAVED" | "PRIVATE" | "CHANNEL" | 'GROUP',
    createdAt: number,
    updatedAt: number,
    title?: string,
    chatAvatar?: string
}