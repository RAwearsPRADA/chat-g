'use client'

import { useState } from "react"
import { useChatActions } from "../lib/useChatActions"
import { useTypingStatus } from "@/features/typing-status/lib/useTypingStatus"
import { useVoiceMessage } from "../lib/useVoiceMessage"
import { SendIcon } from "@/shared/ui/icons/chat-icons/SendIcon"
import { VoicePanel } from "./VoicePanel"

export function ChatInput() {
    const [message, setMessage] = useState<string>('')
    const {handleInputChange} = useTypingStatus()
    const {sendChatMessage} = useChatActions()
    const voice = useVoiceMessage()
    const isMessageEmpty = !message.length? true: false
    const handleSend = () => {
        if (!message.trim())
            return
        sendChatMessage(message)
        setMessage('')
    }


    return <>
        {!voice.isRecording &&
            <input className="w-[80%] p-[7.5px] bg-[#2e2e2e] rounded-[15px]" type="text" id="message" placeholder='Type message' value={message} onChange={(event) => {
                handleInputChange(event.target.value)
                setMessage(event.target.value)}} onKeyDown={(event) => {
                if (event.key === 'Enter'){
                    handleSend()
                }
            }}/>
        }
        <VoicePanel voice={voice} isMessageEmpty={isMessageEmpty}/>
        {!!message.length &&
            <SendIcon className="cursor-pointer" onClick={handleSend}/>
        }
    </>
    
}