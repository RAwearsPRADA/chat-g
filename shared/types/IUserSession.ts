import type WebSocket from "ws";

export interface IUserSession {
    ws: WebSocket,
    chats: Set<number>,
    isTyping: boolean,
    isRecording: boolean,
    isListeningOwnAudio: boolean,
    isListeningAudio: boolean
    actionTarget: number | null,
    isSendingVoiceMessage: boolean
}