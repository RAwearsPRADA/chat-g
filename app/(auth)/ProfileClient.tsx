'use client'

import Sidebar from "@/widgets/sidebar/ui/Sidebar"
import type { ISavedChat } from "@/shared/types/ISavedChat"
import type { User } from "@/shared/types/User"
import { SocketListener } from "@/shared/components/SocketListener"
import { LoadSavedChats } from "@/entities/savedChats/ui/LoadSavedChats"
import { LazyDrawer } from "@/widgets/drawer/ui/LazyDrawer"
import { Chatbox } from "@/widgets/chatbox/ui/ChatBox"
import { Suspense } from "react"

export default function ProfileClient({filtered, selfInfo, wsTicket}: {filtered: ISavedChat[], selfInfo: User, wsTicket: string}) {
    return (
    <>
        <SocketListener wsTicket={wsTicket}/>
        <LoadSavedChats savedChats={filtered} self={selfInfo}/>
        <Sidebar/>
        <Suspense fallback={null}>
            <LazyDrawer/>
        </Suspense>
        <Chatbox/> 
    </>)
}
