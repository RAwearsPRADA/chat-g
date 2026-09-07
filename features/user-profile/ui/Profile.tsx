'use client'
import './styles.css'
import Image from "next/image";
import { defaultAvatar } from '@/shared/ui/defaultAvatar';
import type { User } from '@/shared/types/User';

export default function Profile({user, state, switchState}: {user: User, state: boolean, switchState: () => void}) {
    if (state)
        return (
            <div className="profile__wrapper" onClick={() => switchState()}>
                <div className="profile__inner" onClick={(event) => {
                    event.stopPropagation()
                }}>
                    <div className="profile__header">
                        <Image width={50} src={user.avatar? user.avatar: defaultAvatar} alt="avatar" className='user__avatar'/>
                        <p className="user__nick">{user.nick}</p>
                        <p className="status">online change it!!!</p>
                    </div>
                    <div className="profile__info">
                        <ul className="info__list">
                            <li className="info__item">Number: ADD NUMBER!!!</li>
                            <li className="info__item">Email: {user.email}</li>
                            <li className="info__item">Bio: ADD BIO!!!</li>
                            <li className="info__item">Id: ADD ability to change id</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    return ;
}