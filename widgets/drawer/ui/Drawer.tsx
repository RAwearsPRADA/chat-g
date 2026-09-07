'use client'

import defaultProfileIcon from '@/shared/ui/avatars/user.png'
import settingsIcon from '@/shared/ui/avatars/setting.png'
import Image from 'next/image'
import Profile from '@/features/user-profile/ui/Profile'
import { useUIStore } from '@/shared/model/ui-store'
import { useState } from 'react'
import { useBoundStore } from '@/shared/store/store'
import { LogOutIcon } from '@/shared/ui/icons/LogOutIcon'
import { ws } from '@/shared/api/websocket'


export default function Drawer() {
    const self = useBoundStore(s => s.self)
    const drawerState = useUIStore(s => s.drawerState)
    const {switchDrawerState} = useUIStore.getState()
    const [profileState, setProfileState] = useState<boolean>(false)

    if (!self)
        return null;
    const logout = async () => {
        const request = await fetch('/api/quit')
        const status = await request.ok
        if (status) {
            ws.disconnect()
            window.location.href = '/'
            return
        }
    }
    return (
        <>
        <div className={`${drawerState? 'absolute inset-0 z-10 opacity-[0.7] bg-black': ''}`} onClick={() => {
            switchDrawerState()
        }}></div>
            <aside className={`absolute z-15 w-75 -right-75 top-25 p-3.75 text-white bg-[linear-gradient(180deg,#000,#fff)]
                bg-size-[300%_300%] bg-position-[-100%] h-[calc(100vh-100px)] ${drawerState? 'animate-rightbar-out': ''}`} onClick={(event) => {
                event.stopPropagation()
            }}>
                    <div className="">
                        <div className="flex items-center relative gap-x-3.75 p-6.25 
                            after:absolute after:-bottom-1.25 after:-left-3.75 after:h-px after:w-75 after:bg-black after:content-['']">
                            <Image src={self.avatar? self.avatar: defaultProfileIcon} alt='avatar' className='sidebar__icon' width={30}/> 
                            <p className="user__nick">{self.nick}</p>
                        </div>
                        <ul className="grid gap-y-3.75 cursor-pointer">
                            <li className="flex gap-x-2.5 font-bold">
                                <p className="user__name"></p>
                            </li>
                            <li className="flex gap-x-2.5 font-bold" onClick={() => {
                                setProfileState(true)
                            }}>
                                <Image src={defaultProfileIcon} alt='profile' className='sidebar__icon' title='profile' width={30}/> Profile
                            </li>
                            <li className="flex gap-x-2.5 font-bold">
                                <Image src={settingsIcon} alt='settings' className='sidebar__icon' title='settings' width={30}/> Settings
                            </li>
                            <li className='flex gap-x-2.5 font-bold' title='logout' onClick={logout}>
                                <LogOutIcon/> Log out
                            </li>
                        </ul>
                    </div>
            </aside>
            <Profile user={self} state={profileState} switchState={() => setProfileState(prev => !prev)}/>

        </>
    )
}
