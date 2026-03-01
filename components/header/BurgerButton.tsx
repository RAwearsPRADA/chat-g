'use client'

import { useSidebar } from "@/lib/sidebarStateContext"

export default function BurgerButton() {
    const {toggleSidebarState} = useSidebar()
    return (
            <div className="burger__button" onClick={() => {
                toggleSidebarState()
            }}>
                <div className="burger__strip"></div>
                <div className="burger__strip"></div>
                <div className="burger__strip"></div>
            </div>
    )
}