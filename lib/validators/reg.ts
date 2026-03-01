import { IUser } from "../types/IUser";

export const SPECIAL_SYMBOLS = '!@#$%^&*()_-+='

function passwordContainsSpecialSymbol(password: string): boolean {
    for (let i = 0; i < SPECIAL_SYMBOLS.length; i++) {
        if (password.includes(SPECIAL_SYMBOLS[i])) {
            return true
        }
    }
    return false
}

export function validateData(data: IUser, otherUsers: Omit<IUser, 'password'>[]) {
    let errorType
    if (data.nick.length < 3) errorType = 'name length'
    if (data.email.length < 3 || !data.email.includes('@') || data.email.endsWith(`.`)) errorType = 'email'
    otherUsers.forEach(u => {
        if (u.nick === data.nick) {
            errorType = 'name'
            return
        }
        if (u.email === data.email)
            errorType = 'email'
            return
    })
    if (!!errorType) return errorType
    if (!validatePassword(data.password)) errorType = 'password' 
    if (!!errorType)
        return errorType
}

export function validatePassword(password: string): boolean {
    return (password.length > 6 && passwordContainsSpecialSymbol(password))
}