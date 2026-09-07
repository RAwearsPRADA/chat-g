'use client'

import type { ReturnTypeUseVoiceMessage } from "./useVoiceMessage"
import type { User } from "@/shared/types/User"
import { useCallback, useEffect, useRef, useState } from "react"
import { ws } from "@/shared/api/websocket"
import { useBoundStore } from "@/shared/store/store"

export function useVoicePanelController(voice: ReturnTypeUseVoiceMessage, chatId: number, self: User | null) { 
        const [isAudioPlaying, setIsAudioPlaying] = useState(false)
        const voiceTimeRef = useRef(0)
        const audioWaveContainerRef = useRef<null | HTMLDivElement>(null)
        const timeDisplayRef = useRef<null | HTMLSpanElement>(null)
        const isDragging = useRef(false)
        const waveRef = useRef<HTMLDivElement | null>(null)
        const audioPlayerInterval = useRef<null | NodeJS.Timeout>(null)
        const voiceLengthInterval = useRef<null | NodeJS.Timeout>(null)
        const audioPlayer = useRef<null | HTMLAudioElement>(null)
        const totalVoiceDuration = useRef(0)
        const audioWavePainting = useRef<null | NodeJS.Timeout>(null)
        const playerStartTime = useRef(0)
        const currentAudioURLRef = useRef<string | null>(null)
        const {audio, audioWaveRef, startRecording, pauseRecording, removeAudio, resumeRecording, sendVoiceMessage} = voice
        const recordingStatusRef = useRef(false)
        const listeningOwnVoiceStatusRef = useRef(false)
        const chatboxState = useBoundStore(s => s.chatboxState)
        const isSavedChat = chatboxState?.type === 'SAVED'
        const sendRecordingStatus = useCallback((status: boolean) => {
            if (isSavedChat || !self || recordingStatusRef.current === status)
                return
            recordingStatusRef.current = status
            listeningOwnVoiceStatusRef.current = !status
            ws.send({
                type: 'recording message',
                data: {
                    isRecording: status,
                    messageTarget: chatId,
                    nick: self.nick,
                }
            })
        }, [self, chatId, isSavedChat])
        
        const sendListeningOwnVoiceStatus = useCallback((status: boolean) => {
            if (isSavedChat || !self || listeningOwnVoiceStatusRef.current === status)
                return
            listeningOwnVoiceStatusRef.current = status
            recordingStatusRef.current = !status
            ws.send({
                type: 'listening own voice message',
                data: {
                    isListening: status,
                    messageTarget: chatId,
                    nick: self.nick
                }
            })
        }, [self, chatId, isSavedChat])
        
        const formatVoiceTime = useCallback((ms: number) => {
            const totalSeconds = Math.floor(ms / 1000)
            const minutes = Math.floor(totalSeconds / 60)
            const seconds = totalSeconds % 60
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        }, [])  

        const getAudioTime = useCallback((bar: HTMLDivElement) => {
            const barIndex = parseInt(bar.getAttribute('data-index') || '0', 10)
            if (!barIndex)
                return
            const barProgress =  barIndex / audioWaveRef.current.length
            const progress = totalVoiceDuration.current * barProgress //time depends on bar(column)
            return progress 
        }, [audioWaveRef])

        const updateAudioWave = useCallback((ms: number) => { //paints columns
            if (!audioWaveRef.current.length || !waveRef.current || !totalVoiceDuration.current)
                return
        
            const currentProgress = ms / totalVoiceDuration.current
            if (!audioWaveContainerRef.current)
                return
            const bars = audioWaveContainerRef.current!.children
            const barsLength = bars.length
            for (let i = 0; i < barsLength; i++) {
                const bar = bars.item(i) as HTMLDivElement
                if (!bar)
                    return
                const barProgress = getAudioTime(bar as HTMLDivElement)! / totalVoiceDuration.current 
                if (currentProgress >= barProgress!) {
                    bar.style.backgroundColor = '#3b82f6'
                } else {
                    bar.style.backgroundColor = '#6b7280'
                }
            }
        }, [audioWaveRef, getAudioTime])

        const renderAudioWave = useCallback(() => { //creates columns
            if (!audioWaveContainerRef.current)
                return
            const audioWaveChildren = audioWaveContainerRef.current.children
            for (let i = audioWaveChildren.length; i < audioWaveRef.current.length; i++){
                const bar = document.createElement('div')
                    bar.className = `w-1 bg-blue-500 rounded-full shrink-0 transition-all duration-75 cursor-pointer`
                    bar.style.height = `${audioWaveRef.current[i] * 1.5}%`
                    bar.setAttribute('data-index', (i + 1).toString())
                    audioWaveContainerRef.current.appendChild(bar)
            }
        }, [audioWaveRef, audioWaveContainerRef])  

        const clearAudioWavePainting = useCallback(() => {
            if (audioWavePainting.current) {
                clearInterval(audioWavePainting.current)
                audioWavePainting.current = null
            }
        }, [])  

        const clearAudioPlayerInterval = useCallback(() => {
            if (audioPlayerInterval.current) {
                clearInterval(audioPlayerInterval.current)
                audioPlayerInterval.current = null  
            }
        }, []) 

        const clearVoiceLengthInterval = useCallback(() => {
            if (voiceLengthInterval.current) {
                clearInterval(voiceLengthInterval.current)
                voiceLengthInterval.current = null
            }
        }, [])


        const setAudioWavePainting = useCallback(() => {
            clearAudioWavePainting()
            audioWavePainting.current = setInterval(() => {
                renderAudioWave()
            }, 250)
        }, [clearAudioWavePainting, renderAudioWave])   

        const setVoiceLengthInterval = useCallback(() => {
            clearVoiceLengthInterval()
            voiceLengthInterval.current = setInterval(() => {
                voiceTimeRef.current += 100
                timeDisplayRef.current!.innerText = formatVoiceTime(voiceTimeRef.current)
            }, 100)
        }, [clearVoiceLengthInterval, formatVoiceTime, timeDisplayRef]) 

        const setAudioPlayerInterval = useCallback(() => {
            audioPlayerInterval.current = setInterval(() => {
                    if (!audioPlayer.current)
                        return
                    voiceTimeRef.current = Math.round(audioPlayer.current.currentTime * 1000)
                    updateAudioWave(voiceTimeRef.current)
                    timeDisplayRef.current!.innerText = formatVoiceTime(voiceTimeRef.current)
                }, 100)
        }, [updateAudioWave, timeDisplayRef, voiceTimeRef, audioPlayer, formatVoiceTime])

        const record = useCallback(() => {
            sendRecordingStatus(true)
            startRecording()
            setVoiceLengthInterval()
            setAudioWavePainting()
        }, [startRecording, setVoiceLengthInterval, setAudioWavePainting, sendRecordingStatus])

        const pause = useCallback(() => {
            pauseRecording()
            if (audio.current) {
                const audioURL = URL.createObjectURL(audio.current)
                currentAudioURLRef.current = audioURL
            }
            sendListeningOwnVoiceStatus(true)
            totalVoiceDuration.current = voiceTimeRef.current
            renderAudioWave()
            updateAudioWave(0)
            clearVoiceLengthInterval()
            clearAudioWavePainting()
        }, [pauseRecording, clearVoiceLengthInterval, clearAudioWavePainting, renderAudioWave, updateAudioWave,
            sendListeningOwnVoiceStatus, audio])

        const resume = useCallback(() => {
            if (currentAudioURLRef.current)
                currentAudioURLRef.current = null
            updateAudioWave(totalVoiceDuration.current)
            resumeRecording()
            sendRecordingStatus(true)
            if (audioPlayer.current) {
                clearAudioPlayerInterval()
                audioPlayer.current.pause()
                audioPlayer.current = null
            }
            setIsAudioPlaying(false)
            voiceTimeRef.current = totalVoiceDuration.current
            clearAudioWavePainting()
            clearVoiceLengthInterval()
            renderAudioWave()
            setVoiceLengthInterval()
            setAudioWavePainting()
        }, [resumeRecording, clearVoiceLengthInterval, setVoiceLengthInterval, setAudioWavePainting, renderAudioWave, 
            clearAudioPlayerInterval, clearAudioWavePainting, sendRecordingStatus, updateAudioWave])

        const play = useCallback(() => {
            clearAudioPlayerInterval()
            clearVoiceLengthInterval()
            
            voiceTimeRef.current = 0
            timeDisplayRef.current!.innerText = formatVoiceTime(0)
            if (audioPlayer.current) {
                audioPlayer.current.pause()
                audioPlayer.current = null
            }
            if (!audio.current)
                return
            if (!currentAudioURLRef.current)
                currentAudioURLRef.current = URL.createObjectURL(audio.current)

            const audioURL = currentAudioURLRef.current
            audioPlayer.current = new Audio(audioURL)
            audioPlayer.current.load()
            audioPlayer.current.volume = 0.75
            audioPlayer.current.onloadedmetadata = () => {
                if (playerStartTime.current !== 0)
                    audioPlayer.current!.currentTime = playerStartTime.current
                setIsAudioPlaying(true)
                audioPlayer.current!.play()
                setAudioPlayerInterval()
            }
            audioPlayer.current.onended = () => {
                if (!audioPlayer.current)
                    return
                setIsAudioPlaying(false)
                clearVoiceLengthInterval()
                clearAudioPlayerInterval()
                playerStartTime.current = 0
                updateAudioWave(totalVoiceDuration.current)
                timeDisplayRef.current!.innerText = formatVoiceTime(totalVoiceDuration.current).toString()
                audioPlayer.current = null
            }

        }, [audio, timeDisplayRef, clearAudioPlayerInterval, clearVoiceLengthInterval, 
            updateAudioWave, formatVoiceTime, setAudioPlayerInterval,
        ])

        const stopAudioPlaying = useCallback(() => {
            if (!audioPlayer.current)
                return
            audioPlayer.current.pause()
            playerStartTime.current = audioPlayer.current.currentTime
            setIsAudioPlaying(false)
            clearAudioWavePainting()
            clearAudioPlayerInterval()
            clearVoiceLengthInterval()  
        }, [clearAudioWavePainting, clearAudioPlayerInterval, clearVoiceLengthInterval]) 

        const remove = useCallback(() => {
            if (audioPlayer.current) {
                audioPlayer.current.pause()
                audioPlayer.current = null
            }
            if (currentAudioURLRef.current)
                URL.revokeObjectURL(currentAudioURLRef.current)
            currentAudioURLRef.current = null
            recordingStatusRef.current = false
            listeningOwnVoiceStatusRef.current = false
            setIsAudioPlaying(false)
            removeAudio()
            clearAudioPlayerInterval()
            clearVoiceLengthInterval()
            clearAudioWavePainting()
            voiceTimeRef.current = 0
            if (timeDisplayRef.current)
                timeDisplayRef.current.innerText = formatVoiceTime(0)
            if (isSavedChat)
                return
            ws.send({
                type: 'removed voice message',
                data: {
                    nick: self!.nick,
                    messageTarget: chatId
                }
            })
        }, [removeAudio, clearAudioPlayerInterval, clearVoiceLengthInterval, clearAudioWavePainting, 
            formatVoiceTime, isSavedChat, timeDisplayRef, chatId, self])   

        const send = useCallback(async (self: User, chatId: number) => {
            const blob = await sendVoiceMessage()
            if (!blob) 
                return
            const formData = new FormData()
            formData.append('voice', blob)
            ws.send({
                type: 'sending voice message',
                data: {
                    messageTarget: chatId,
                    nick: self.nick,
                    isSending: true
                }
            })
            const request = await fetch('/api/send-voice', {
                method: "POST", 
                body: formData 
            })
            if (!request.ok) {
                ws.send({
                    type: 'sending voice message',
                    data: {
                        messageTarget: chatId,
                        nick: self.nick,
                        isSending: false
                    }
                })
                return
            }
            const result = await request.json()
            const url = result.url as string
            ws.send({
                type: 'new voice message',
                data: {
                    user: self,
                    messageTarget: chatId,
                    url: url
                }
            })
            remove()
        }, [sendVoiceMessage, remove])

        const handleMouseUp = useCallback(() => {
            if (!voice.isStoppedRecording)
                return
            isDragging.current = false
            if (audioPlayer.current) {
                audioPlayer.current.currentTime = playerStartTime.current
                audioPlayer.current.play()
                setAudioPlayerInterval()
            } else if (audio.current) {
                play()
            }
            setIsAudioPlaying(true)
        }, [audio, play, setAudioPlayerInterval, voice.isStoppedRecording])

        const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            if (audioPlayer.current && !audioPlayer.current.paused) {
                clearAudioPlayerInterval()
                audioPlayer.current.pause()
                setIsAudioPlaying(false)
            }
            if (!voice.isStoppedRecording)
                return
            isDragging.current = true
            const barTime = getAudioTime(event.target as HTMLDivElement)
            if (!barTime)
                return
            playerStartTime.current = barTime / 1000
            updateAudioWave(barTime)
        }, [updateAudioWave, getAudioTime, voice.isStoppedRecording, clearAudioPlayerInterval])   

        const handleMouseMove = useCallback((event: React.MouseEvent) => {
            if (!isDragging.current || !voice.isStoppedRecording)
                return
            const barTime = getAudioTime(event.target as HTMLDivElement)
            if (!barTime)
                return
            updateAudioWave(barTime)
            playerStartTime.current = barTime / 1000
            timeDisplayRef.current!.innerText = formatVoiceTime(barTime)
            if (audioPlayer.current && !audioPlayer.current.paused){
                clearAudioPlayerInterval()
                audioPlayer.current.pause()
                setIsAudioPlaying(false)
            }
        }, [getAudioTime, updateAudioWave, formatVoiceTime, timeDisplayRef, clearAudioPlayerInterval, voice.isStoppedRecording])

        useEffect(() => {
            return () => {
                clearAudioPlayerInterval()
                clearAudioWavePainting()
                clearVoiceLengthInterval()
                currentAudioURLRef.current = null
                remove()
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    
        return {
            isAudioPlaying, 
            waveRef,
            timeDisplayRef,
            audioWaveContainerRef,
            voiceTimeRef,
            record, 
            pause, 
            resume,
            play, 
            remove, 
            handleMouseDown, 
            handleMouseMove, 
            handleMouseUp, 
            stopAudioPlaying, 
            formatVoiceTime,
            send
        }
}

export type ReturnTypeVoiceController = ReturnType<typeof useVoicePanelController>