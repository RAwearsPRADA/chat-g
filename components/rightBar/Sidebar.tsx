'use client'

import './styles.css'
import { useSidebar } from '@/lib/sidebarStateContext'
import profileIcon from './user.png'
import settingsIcon from './setting.png'
import Image from 'next/image'
import { useUserProfile } from '../profile/ProfileContext'
import type { User } from '@/app/generated/prisma/client'

export default function Rightbar({self}: {self: User}) {
    const {switchProfileState} = useUserProfile()
    const {sidebarState, toggleSidebarState} = useSidebar()
    return (
        <>
        <div className={`rightbar__container ${sidebarState? 'active': ''}`} onClick={() => {
            toggleSidebarState()
        }}></div>
            <aside className={`rightbar ${sidebarState? 'active': ''}`} onClick={(event) => {
                event.stopPropagation()
            }}>
                    <div className="rightbar__inner">
                        <div className="user__info">
                            <Image src={self.avatar? self.avatar: profileIcon} alt='avatar' className='sidebar__icon' width={30}/> 
                            <p className="user__nick">{self.nick}</p>
                        </div>
                        <ul className="rightbar__menu">
                            <li className="rightbar__item">
                                <p className="user__name"></p>
                            </li>
                            <li className="rightbar__item" onClick={() => {
                                switchProfileState()
                            }}>
                                <Image src={profileIcon} alt='profile' className='sidebar__icon' width={30}/> Profile
                            </li>
                            <li className="rightbar__item">
                                <Image src={settingsIcon} alt='settings' className='sidebar__icon' width={30}/> Settings
                            </li>
                        </ul>
                    </div>
                    
            </aside>
        </>
    )
}
