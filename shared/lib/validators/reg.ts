import type { IUser } from "@/shared/types/IUser";

export const SPECIAL_SYMBOLS = '!@#$%^&*()_-+='

export function passwordContainsSpecialSymbol(password: string): boolean {
    for (let i = 0; i < SPECIAL_SYMBOLS.length; i++) {
        if (password.includes(SPECIAL_SYMBOLS[i])) {
            return true
        }
    }
    return false
}

export function validateData(data: IUser, otherUsers: Omit<IUser, 'password'>[]) {
    if (data.nick.includes(' '))
        return 'space in name'
    if (data.nick.length < 3) 
        return 'name length'
    if (data.email.length < 3 || !data.email.includes('@') || data.email.endsWith(`.`) || data.email.includes(' ')) 
        return 'email'
    const hasNickDublicate = otherUsers.some(u => u.nick === data.nick)
    if (hasNickDublicate) 
        return 'name'
    const hasEmailDublicate = otherUsers.some(u => u.email === data.email)
    if (hasEmailDublicate) 
        return 'email'

    if (!validatePassword(data.password)) 
        return 'password' 
    return null
}

export function validatePassword(password: string): boolean {
    return (password.length > 6 && passwordContainsSpecialSymbol(password))
}