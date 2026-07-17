import Image from "next/image"
import { defaultAvatar } from "@/shared/ui/defaultAvatar"
import { memo } from "react"

export const MessageAvatar = memo(function Avatar({user, title} : {user: {nick: string, avatar: string | null}, title: string}){
    return <Image alt={user.nick} src={user.avatar? user.avatar: defaultAvatar} width={20} title={title}/>
})