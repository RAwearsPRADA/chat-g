import { useCallback, useEffect, useRef, useState } from 'react'

export function useNotification(enabled: boolean = true) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isUnlocked, setIsUnlocked] = useState(false)
    const isUnlockedRef = useRef(false)
    useEffect(() => {
        isUnlockedRef.current = isUnlocked
    }, [isUnlocked])
    useEffect(() => {
      audioRef.current = new Audio('/sounds/new-message-notification.mp3')
      audioRef.current.volume = 0.3
      audioRef.current.preload = 'auto'

      const unlockAudio = async () => {
        if (isUnlockedRef.current || !audioRef.current) 
          return
        try {
            audioRef.current.volume = 0
            await audioRef.current.play()
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            audioRef.current.volume = 0.3
            setIsUnlocked(true) 
        } catch {
        }
      }

      window.addEventListener('click', unlockAudio)
      window.addEventListener('keydown', unlockAudio)

      return () => {
        window.removeEventListener('click', unlockAudio)
        window.removeEventListener('keydown', unlockAudio)
        if (audioRef.current)
          audioRef.current.src = ''
        audioRef.current = null
      }
    }, []) 

    const play = useCallback(() => {
      if (!enabled || !isUnlockedRef.current || !audioRef.current) 
        return
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.warn('🔇 Could not play sound:', err)
      })
    }, [enabled])

    return { play, isUnlocked } 
}