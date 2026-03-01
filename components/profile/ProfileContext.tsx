'use client'
import { createContext, ReactNode, useContext, useState } from "react";

interface IProfileWindowState {
    profileState: boolean,
    switchProfileState: () => void
}

const ProfileContext = createContext<IProfileWindowState | null>(null)

export function ProfileProvider({children}: {children: ReactNode}) {
    const [profileState, setProfileState] = useState<boolean>(false)
    const switchProfileState = (): void => {
        setProfileState(prev => !prev)
    }
    return (<>
    <ProfileContext.Provider value={{profileState, switchProfileState}}>
        {children}
    </ProfileContext.Provider>
    </>)
}

export const useUserProfile = () => {
    const context = useContext(ProfileContext)
    if (!context) throw new Error('must be in provider')
    return context
}