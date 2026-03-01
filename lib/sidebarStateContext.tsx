'use client'

import { useContext, createContext, ReactNode, useState } from "react"

interface ISidebarContext {
    sidebarState: boolean,
    toggleSidebarState: () => void
}

const SidebarContext = createContext<ISidebarContext | null>(null)

export function SidebarProvider({children}: {children: ReactNode}) {
    const [sidebarState, setSidebarState] = useState<boolean>(false)

    const toggleSidebarState = () => {
        setSidebarState(current => !current)
    }

    return (
        <>
            <SidebarContext.Provider value={{sidebarState, toggleSidebarState}}>
                {children}
            </SidebarContext.Provider>
        </>
    )
}

export const useSidebar = () => {
    const context = useContext(SidebarContext)
    if (!context) throw new Error('must be used in SidebarProvider')
    return context
}