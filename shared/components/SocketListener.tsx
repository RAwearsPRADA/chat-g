'use client'

import { useEffect } from "react"
import { useBoundStore } from "../store/store"
import { ws } from "../api/websocket"
import { useNotification } from "@/features/notification/useNotification"

export function SocketListener({wsTicket}: {wsTicket: string}) {
    const nick = useBoundStore().self?.nick
    const wsMessageHandler = useBoundStore(s => s.wsMessageHandler)
    const setAudioPlayer = useBoundStore(s => s.setAudio)
    const {play} = useNotification()
    const statusHandler = useBoundStore(s => s.setWsStatus)

    useEffect(() => {
        setAudioPlayer(play)
        ws.setMessageHandler(wsMessageHandler)
        ws.statusHandler = statusHandler
        if (nick)
            ws.connect(wsTicket)
        return () => {
            setAudioPlayer(() => {})
        }
    }, [nick, wsMessageHandler, setAudioPlayer, play, statusHandler, wsTicket])
    return null
}