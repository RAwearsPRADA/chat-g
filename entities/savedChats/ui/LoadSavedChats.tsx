'use client'

import type { User } from "@/shared/types/User";
import type { ISavedChat } from "@/shared/types/ISavedChat";
import { useEffect } from "react";
import { useBoundStore } from "@/shared/store/store";


export function LoadSavedChats({savedChats, self}: {savedChats: ISavedChat[], self: User}) {
    const setSavedChats = useBoundStore(s => s.setSavedChats)
    const setSelfInfo = useBoundStore(s => s.setSelfInfo)
    const initObserver = useBoundStore(s => s.initChatObserver)
    useEffect(() => {
        initObserver()
        setSelfInfo(self)
        setSavedChats(savedChats as unknown as ISavedChat[])
    }, [savedChats, setSavedChats, setSelfInfo, initObserver, self])
    return <>
    </>
}