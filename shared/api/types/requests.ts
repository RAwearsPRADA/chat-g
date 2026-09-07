import type { User } from "@/shared/types/User"
import type { Message } from "@/shared/types/Message"

export type Request = 
ITyping | 
INewMessage | 
IRecordingMessage | 
INewVoiceMessage | 
IUserSendingVoiceMessage |
IUserListensOwnVoiceMessage |
IUserListensVoiceMessage |
IUserRemovedVoiceMesage |
PING |
IReadMessage

export interface PING {
    type: 'ping',
    data: {messageTarget: 0}
}

export interface ITyping {
    type: 'typing',
    data: {
        nick: string,
        messageTarget: number,
        isTyping: boolean
    }
}

export interface INewMessage {
    type: 'new message'
    data: {
        user: {id: number, nick: string, avatar: string | null},
        messageTarget: number,
        isTyping: boolean,
        message: Message,
        isFirstMessageInChat?: boolean
    }
}

export interface IRecordingMessage {
    type: "recording message"
    data: {
        nick: string,
        messageTarget: number,
        isRecording: boolean
    }
}

export interface INewVoiceMessage {
    type: 'new voice message'
    data: {
        user: User,
        messageTarget: number,
        url: string,
    }
}

export interface IUserListensOwnVoiceMessage { //listening or not
    type: 'listening own voice message',
    data: {
        messageTarget: number,
        nick: string,
        isListening: boolean
    }
}

export interface IUserListensVoiceMessage {
    type: 'listening voice message',
    data: {
        messageTarget: number,
        nick: string,
        isListening: boolean
    }
}

export interface IUserSendingVoiceMessage {
    type: 'sending voice message',
    data: {
        messageTarget: number,
        nick: string,
        isSending: boolean
    }
}

export interface IUserRemovedVoiceMesage {
    type: 'removed voice message',
    data: {
        messageTarget: number,
        nick: string,
    }
}

export interface IReadMessage {
    type: 'read message',
    data: {
        messageTarget: number,
        lastMessageTimestamp: number
    }
}