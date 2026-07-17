'use client'

import { useUIStore } from "../model/ui-store"

export default function BurgerButton() {
    const {switchDrawerState} = useUIStore.getState()
    return (
            <div className="burger__button" onClick={() => {
                switchDrawerState()
            }}>
                <div className="burger__strip"></div>
                <div className="burger__strip"></div>
                <div className="burger__strip"></div>
            </div>
    )
}