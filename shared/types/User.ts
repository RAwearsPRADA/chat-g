export interface User {
    id: number,
    nick: string,
    name?: string,
    email: string,
    password: string,
    avatar: string | null,
    createdAt: number
}