import type { ITyping, INewMessage, 
   INewVoiceMessage, 
   IRecordingMessage, 
   IUserListensOwnVoiceMessage, 
   IUserListensVoiceMessage, 
   IUserSendingVoiceMessage,
   IUserRemovedVoiceMesage, 
   IReadMessage} from "./requests"

export type Response = INewMessage | 
   ITyping | 
   IOnlineUsers | 
   IUserDisconnected | 
   IUserConnected | 
   IUserListensOwnVoiceMessage |
   INewVoiceMessage |
   IUserListensVoiceMessage |
   IRecordingMessage |
   IUserSendingVoiceMessage |
   IUserRemovedVoiceMesage |
   INewTicket |
   IReadMessage


interface IOnlineUsers {
    type: 'online users'
    data: 
     {
        onlineUsers: string[]
     }
}

interface IUserDisconnected {
   type: "user disconnected",
   data: {
      nick: string
   }
}

interface IUserConnected {
   type: 'new user connected',
   data: {
      nick: string
   }
}

interface INewTicket {
   type: 'updated ticket',
   data: {
      ticket: string
   }
}