import { cookies } from "next/headers";
import { IUser } from "../types/IUser";


export async function isUserAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return false
    else {
        const response = await fetch('http://localhost:3000/api/me')
        const data = await response.json() as {message: string, data: Omit<IUser, "password">, status: boolean}
        if (data.status) return true
    }
}