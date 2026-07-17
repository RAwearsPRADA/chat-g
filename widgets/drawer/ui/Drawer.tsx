'use client'

import './styles.css'
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
        <div className={`rightbar__container ${drawerState? 'active': ''}`} onClick={() => {
            switchDrawerState()
        }}></div>
            <aside className={`rightbar ${drawerState? 'active': ''}`} onClick={(event) => {
                event.stopPropagation()
            }}>
                    <div className="rightbar__inner">
                        <div className="user__info">
                            <Image src={self.avatar? self.avatar: defaultProfileIcon} alt='avatar' className='sidebar__icon' width={30}/> 
                            <p className="user__nick">{self.nick}</p>
                        </div>
                        <ul className="rightbar__menu">
                            <li className="rightbar__item">
                                <p className="user__name"></p>
                            </li>
                            <li className="rightbar__item" onClick={() => {
                                setProfileState(true)
                            }}>
                                <Image src={defaultProfileIcon} alt='profile' className='sidebar__icon' width={30}/> Profile
                            </li>
                            <li className="rightbar__item">
                                <Image src={settingsIcon} alt='settings' className='sidebar__icon' width={30}/> Settings
                            </li>
                            <li className='rightbar__item' onClick={logout}>
                                <LogOutIcon/> Log out
                            </li>
                        </ul>
                    </div>
            </aside>
            <Profile user={self} state={profileState} switchState={() => setProfileState(prev => !prev)}/>

        </>
    )
}
