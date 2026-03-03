'use server'
import Header from "@/components/header/Header"
import Sidebar from "@/components/aside/Sidebar"
import {Rightbar} from "@/components/rightBar/OptimizedComponent"
import { Chatbox } from "@/components/chatBox/ChatBox"
import { prisma } from "@/lib/prisma"
import UserProfile from "@/components/profile/Profile"
import { ProfileProvider } from "@/components/profile/ProfileContext"
import { ChatboxProvider } from "@/components/chatBox/chatBoxContext"
import { SidebarProvider } from "@/lib/sidebarStateContext"
import { WebSocketProvider } from "@/lib/websocketProvider/WebSocketProvider"
import { User } from "../generated/prisma/client"
import { ChatProvider } from "@/lib/savedChatContext"


export default async function Profile({token}: {token: {nick: string, email: string}}) {
    const selfInfo: User | null= await prisma.user.findFirst({
        where: {
            nick: token?.nick
        }
    })
    if (!selfInfo) 
        return
    return (
  <>
  <ChatProvider>
    <ChatboxProvider>
          <WebSocketProvider> 
              <SidebarProvider> 
                      <ProfileProvider>
                          <Header/>
                          <Sidebar self={selfInfo}/>
                          <Rightbar self={selfInfo}/>
                          <Chatbox self={selfInfo}/> 
                          <UserProfile user={selfInfo}/>
                      </ProfileProvider>
              </SidebarProvider>
          </WebSocketProvider> 
    </ChatboxProvider>
  </ChatProvider>
  </>
)
}