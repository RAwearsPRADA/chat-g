'use client'

import { useEffect } from "react"

export function PreloaderHider() {
    useEffect(() => {
        const preloader = document.getElementById('preloader')
        if (preloader) {
            preloader.classList.add('preloader-hidden')
            const timer = setTimeout(() => {
                if (preloader)
                    preloader.style.display = 'none'
            }, 300)

        return () => {
            clearTimeout(timer)
            }
        }
    }, [])

    return null
}