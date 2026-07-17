import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex')
    const buf = (await scryptAsync(password, salt, 64)) as Buffer
    return `${salt}:${buf.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string){
    try {
        const [salt, key] = hash.split(':')
        const buf = (await scryptAsync(password, salt, 64)) as Buffer
        const keyBuffer = Buffer.from(key, 'hex')

        return timingSafeEqual(buf, keyBuffer)
    } catch {
        return false
    }
}