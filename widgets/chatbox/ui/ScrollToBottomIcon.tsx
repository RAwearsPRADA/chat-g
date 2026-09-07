'use client'

import { ArrowDown } from "@/shared/ui/icons/chat-icons/ArrowDown"




export function ScrollToBottomIcon({isAtBottom, scrollToBottom}: {isAtBottom: boolean, scrollToBottom: () => void}) {
    return isAtBottom? <></>: <ArrowDown scrollToBottom={scrollToBottom}/>
}