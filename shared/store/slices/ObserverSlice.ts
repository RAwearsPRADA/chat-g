import type { StateCreator } from "zustand";
import type { ChatSlice } from "./chatSlice";
import { ws } from "@/shared/api/websocket";

export interface ObserverSlice {
    observer: IntersectionObserver | null,
    readDebounce: NodeJS.Timeout | null,
    isAtBottom: boolean,
    initChatObserver: () => void
    observe: (element: HTMLLIElement) => void
    forcedScrollToBottom: (isForced?: boolean) => void,
    setForcedScrollToBottom: (fn: (isForced?: boolean) => void) => void
}

interface BoundedSlice extends ChatSlice, ObserverSlice {}


export const createObserverSlice: StateCreator<BoundedSlice, [], [], ObserverSlice> = (set, get) => ({
    observer: null,
    forcedScrollToBottom: () => {},
    readDebounce: null,
    isAtBottom: false,
    setForcedScrollToBottom: (fn) => {
        set({forcedScrollToBottom: fn})
    },
    initChatObserver: () => {
        const observer = new IntersectionObserver((entries) => {
          let maxReadId = 0
          entries.forEach(entry => {
            if (!entry.isIntersecting)
              return
            const isUnreadMessage = entry.target.getAttribute('data-is-read')
            const messageTimestamp = entry.target.getAttribute('data-timestamp')
            if (isUnreadMessage === 'false') {
              entry.target.setAttribute('data-is-read', 'true')
              observer.unobserve(entry.target)
              const timestamp = Number(messageTimestamp)
              if (timestamp > maxReadId) {
                maxReadId = timestamp
              }
            }
          })
          if (maxReadId > 0) {
            const oldDebounce = get().readDebounce
            if (oldDebounce)
              clearTimeout(oldDebounce)
            const timer = setTimeout(() => {
            ws.send({
              type: "read message",
              data: {
                messageTarget: get().chatId,
                lastMessageTimestamp: maxReadId
              }
            })
          }, 500)
          set({readDebounce: timer})
          }
        })
        set({observer: observer})
    },
    observe : (element) => {
      
      get().observer?.observe(element)
    }
})