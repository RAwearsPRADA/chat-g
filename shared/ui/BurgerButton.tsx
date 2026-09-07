'use client'

import { useUIStore } from "../model/ui-store"

export default function BurgerButton() {
    const {switchDrawerState} = useUIStore.getState()
    return (
            <div className="grid relative cursor-pointer gap-y-0.75 h-6.25 aspect-square" onClick={() => {
                switchDrawerState()
            }}>
                <div className="w-[80%] h-0.5 bg-white"></div>
                <div className="w-[80%] h-0.5 bg-white"></div>
                <div className="w-[80%] h-0.5 bg-white"></div>
            </div>
    )
}