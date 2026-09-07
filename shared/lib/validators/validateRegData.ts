import { validatePassword } from "@/shared/lib/validators/reg"

export const validateData = (nick: string, email: string, password: string): string | null => {
        if (nick.includes(' ')) {
            return 'space in name'
        }
        if (nick.length < 3 ) {
            return 'name length'
        }
        if (!email.includes('@') || email.includes(' ')) {
            return 'email'
        }
        if (!validatePassword(password)) {
            return 'password'
        }
        return null
    }