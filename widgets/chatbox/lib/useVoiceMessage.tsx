'use client'

import { useState, useRef, useCallback } from "react"

export function useVoiceMessage() {
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [isStoppedRecording, setIsStoppedRecording] = useState<boolean>(false)
    const audioWaveRef = useRef<number[]>([])
    const mediaRecorderRef = useRef<null | MediaRecorder>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const audio = useRef<null | Blob>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<null | AnalyserNode>(null)
    const timerRef = useRef<null | NodeJS.Timeout>(null)
    const waveHistoryRef = useRef<number[]>([])

    const getSupportedMimeType = useCallback(() => { 
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            return 'audio/webm;codecs=opus'
        }
        if (MediaRecorder.isTypeSupported('audio/webm')) {
            return 'audio/webm'
        }
        return 'audio/mp4' 
    }, [])

    const startWave = useCallback(() => {
        if (!analyserRef.current)
            return
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        timerRef.current = setInterval(() => {
            if (!analyserRef.current || mediaRecorderRef.current?.state === 'paused')
                return
            analyserRef.current.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < bufferLength; i++) 
                sum += dataArray[i]
            const average = sum / bufferLength

            const barHeight = Math.max(10, Math.min(100, (average / 128) * 100))

            waveHistoryRef.current.push(barHeight + 5)
            audioWaveRef.current = [...waveHistoryRef.current]
        }, 250)
    }, [])
    
    const startRecording = useCallback(async () => {
        setIsRecording(true)
        audioWaveRef.current = []
        audioChunksRef.current = []
        waveHistoryRef.current = []

        const mimeType = getSupportedMimeType()
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        })
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)
        audioContextRef.current = audioContext
        analyserRef.current = analyser

        startWave()

        mediaRecorderRef.current = new MediaRecorder(stream, {mimeType: mimeType, audioBitsPerSecond: 16000})
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0)
                audioChunksRef.current.push(event.data)
        }
        mediaRecorderRef.current.start(250)

        mediaRecorderRef.current.onstop = () => {
            audio.current = new Blob(audioChunksRef.current, {type: mimeType})
        }
    }, [getSupportedMimeType, startWave])
    
    const pauseRecording = useCallback(() => {
        setIsStoppedRecording(true)
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        audio.current = new Blob(audioChunksRef.current, {type: getSupportedMimeType()})
        if (!mediaRecorderRef.current)
            return
        mediaRecorderRef.current.pause()
    }, [getSupportedMimeType])

    const resumeRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        setIsStoppedRecording(false)
        if (!mediaRecorderRef.current)
            return
        audio.current = null
        mediaRecorderRef.current.resume()
        startWave()
    }, [startWave])

    const removeAudio = useCallback(() => {
        setIsRecording(false)
        setIsStoppedRecording(false)
        audioChunksRef.current = []
        waveHistoryRef.current = []
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed'){
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        analyserRef.current = null
        if (!mediaRecorderRef.current)
            return
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        mediaRecorderRef.current = null
    }, [])

    const sendVoiceMessage = useCallback(() => {
        if (!mediaRecorderRef.current)
            return Promise.resolve(null)
        return new Promise<null | Blob>((resolve) => {
            if (!mediaRecorderRef.current){
                resolve(null)
                return
            }
            mediaRecorderRef.current.onstop = () => {
                const finalBlob = new Blob(audioChunksRef.current, {type: getSupportedMimeType()})
                
                removeAudio()

                resolve(finalBlob)
                return
            }
            mediaRecorderRef.current.stop()
        })
    }, [removeAudio, getSupportedMimeType])

    return {
        isRecording, 
        isStoppedRecording, 
        audio, 
        audioChunksRef, 
        audioWaveRef,
        waveHistoryRef,
        startRecording, 
        pauseRecording, 
        removeAudio, 
        resumeRecording, 
        sendVoiceMessage, 
        getSupportedMimeType, 
        setIsRecording
    }
}

export type ReturnTypeUseVoiceMessage = ReturnType<typeof useVoiceMessage>