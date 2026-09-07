/* eslint-disable react-hooks/refs */
import type { ReturnTypeUseVoiceMessage } from "../lib/useVoiceMessage"
import { useVoicePanelController } from "../lib/useVoicePanelController"
import { useBoundStore } from "@/shared/store/store"
import { TrashIcon } from "@/shared/ui/icons/chat-icons/TrashIcon"
import { ResumeIcon } from "@/shared/ui/icons/chat-icons/ResumeIcon"
import { MicroIcon } from "@/shared/ui/icons/chat-icons/MicroIcon"
import { StopIcon } from "@/shared/ui/icons/chat-icons/StopIcon"
import { SendIcon } from "@/shared/ui/icons/chat-icons/SendIcon"


export function VoicePanel({isMessageEmpty, voice}: {isMessageEmpty: boolean, voice: ReturnTypeUseVoiceMessage}){
        const chatId = useBoundStore(s => s.chatId)
        const self = useBoundStore(s => s.self)
        const voicePanelController = useVoicePanelController(voice, chatId, self)
        const {isRecording, isStoppedRecording, sendVoiceMessage} = voice
        const {
            isAudioPlaying,
            waveRef, 
            timeDisplayRef,
            audioWaveContainerRef,
            voiceTimeRef,
            resume, 
            remove, 
            handleMouseDown, 
            handleMouseMove, 
            handleMouseUp, 
            formatVoiceTime, 
            pause, 
            play, 
            stopAudioPlaying, 
            record,
            send
        } = voicePanelController
        if (!self)
            return null
        return (
            <>
                {isRecording && (
                    <div className="recording-panel w-full flex justify-between items-center px-4 py-2 bg-zinc-900 rounded-xl min-h-11">
                        <div className="recording-tools flex gap-x-5 items-center flex-1 mr-4 overflow-x-hidden" ref={waveRef} 
                            suppressHydrationWarning={true}>
                            <div className="flex gap-x-2">
                                <TrashIcon onClick={remove} className="cursor-pointer text-zinc-400 hover:text-red-500" />
                                <span ref={timeDisplayRef}>{formatVoiceTime(voiceTimeRef.current)}</span>
                            </div>
                            <div 
                                        onMouseUp={handleMouseUp}
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        className="audio-wave flex items-end gap-0.75 h-8 flex-1 overflow-x-hidden justify-end cursor-pointer"
                                        ref={audioWaveContainerRef}
                                    >
                                        
                                    </div>
                            {isStoppedRecording ? (
                                <>
                                    
                                        
                                    {isAudioPlaying? 
                                        <StopIcon onClick={stopAudioPlaying} className="cursor-pointer text-red-500" />:
                                        <ResumeIcon onClick={play} className="cursor-pointer text-emerald-500" />
                                    }
                                    <MicroIcon onClick={resume} className="cursor-pointer"/>
                                </>
                            ) : (
                                <>
                                    <StopIcon onClick={pause} className="cursor-pointer text-red-500" />
                                </>
                            )}
                        </div>
                        <SendIcon onClick={() => send(self, chatId)} className="cursor-pointer text-blue-500 hover:text-blue-400" />
                    </div>
                )}
                
                {isMessageEmpty && !isRecording && (
                    <MicroIcon onClick={record} className="cursor-pointer"/>            
                )}      
            </>
        )
}