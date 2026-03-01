'use client'
import './styles.css'
import Image from "next/image";
import { defaultAvatar } from "@/lib/defaultAvatar";
import { useUserProfile } from "./ProfileContext";
import { User } from '@/app/generated/prisma/client';

export default function Profile({user}: {user: User}) {
    const {profileState, switchProfileState} = useUserProfile()
    if (profileState)
        return (
            <div className="profile__wrapper" onClick={() => switchProfileState()}>
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