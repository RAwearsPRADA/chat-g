import { useBoundStore } from "@/shared/store/store"
import { useCallback, useEffect, useRef, useState } from "react"

export function useAutoScroll<T>(dependency: T | T[]) {
    const setForcedScroll = useBoundStore(s => s.setForcedScrollToBottom)
    const containerRef = useRef<HTMLUListElement>(null)
    const anchorRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const [isAtBottom, setIsAtBottom] = useState<boolean>(false)
    const isAtBottomRef = useRef<boolean>(false)

    const scrollToBottom = useCallback((isForced: boolean = false) => {
        if (!containerRef.current)
            return
        if (isForced) {
            requestAnimationFrame(() => {
                anchorRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'})
                isAtBottomRef.current = true   
            })
            return
        }
        const lastUnreadMessage = containerRef.current.querySelector('[data-is-read=false]')
        if (lastUnreadMessage?.querySelector('.self'))
            return
        if (lastUnreadMessage) {
            if (isAtBottomRef.current) {
                anchorRef.current?.scrollIntoView({behavior: 'instant', block: 'end'})
                return
            }
            lastUnreadMessage.scrollIntoView({behavior: 'smooth', block: 'end'})
            return
        }
        setTimeout(() => {
            anchorRef.current?.scrollIntoView({behavior: 'instant', block: 'end'})
            isAtBottomRef.current = true
        }, 30)
    }, [])

    const setupObserver = useCallback(() => {
        if (!anchorRef.current || !containerRef.current)
            return
        observerRef.current?.disconnect()
        observerRef.current = new IntersectionObserver(([entry]) => {
            isAtBottomRef.current = entry.isIntersecting
            setIsAtBottom(entry.isIntersecting)
        }, {
            root: containerRef.current,
            threshold: 0
        })
        observerRef.current.observe(anchorRef.current)
    }, [])

    const setContainerRef = useCallback((node: HTMLUListElement | null) => {
        containerRef.current = node
        if (node) {
            setupObserver()
        }
    }, [setupObserver])

    const setAnchorRef = useCallback((node: HTMLDivElement | null) => {
        anchorRef.current = node
        if (node) {
            setupObserver()
        }
    }, [setupObserver])

    useEffect(() => {
        return () => observerRef.current?.disconnect()
    }, [])
    useEffect(() => {
        setForcedScroll(scrollToBottom)
        scrollToBottom();
    }, [scrollToBottom, setForcedScroll]); 
    
    useEffect(() => {
        if (isAtBottomRef.current) {
            scrollToBottom()
        }
    }, [dependency, scrollToBottom]); 
    return {scrollToBottom, isAtBottom, setAnchorRef, setContainerRef}
}
