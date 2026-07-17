// lib/validateData.test.ts
import { validateData, validatePassword } from './reg'
import type { IUser } from '@/shared/types/IUser'


describe('validatePassword', () => {
    test('возвращает true для валидного пароля', () => {
        expect(validatePassword('password123!')).toBe(true)
    })

    test('возвращает false для короткого пароля', () => {
        expect(validatePassword('123!')).toBe(false)
    })

    test('возвращает false для пароля без спецсимвола', () => {
        expect(validatePassword('password123')).toBe(false)
    })

    test('возвращает true для пароля ровно из 7 символов', () => {
        expect(validatePassword('pass!12')).toBe(true)
    })

    test('возвращает false для пароля из 6 символов', () => {
        expect(validatePassword('pass!1')).toBe(false)
    })
})

describe('validateData', () => {
    const mockUsers: Omit<IUser, 'password'>[] = [
        { nick: 'existing', email: 'test@example.com' },
        { nick: 'user123', email: 'user@test.com' }
    ]

    const createMockUser = (overrides: Partial<IUser> = {}): IUser => ({
        nick: 'newuser',
        email: 'new@test.com',
        password: 'password!',
        ...overrides
    })

    test('возвращает null для валидных данных', () => {
        const user = createMockUser()
        expect(validateData(user, mockUsers)).toBeNull()
    })

    test('возвращает "name length" для короткого ника', () => {
        const user = createMockUser({ nick: 'ab' })
        expect(validateData(user, mockUsers)).toBe('name length')
    })

    test('возвращает "email" для email без @', () => {
        const user = createMockUser({ email: 'invalid.email' })
        expect(validateData(user, mockUsers)).toBe('email')
    })

    test('возвращает "email" для email с точкой в конце', () => {
        const user = createMockUser({ email: 'test@example.com.' })
        expect(validateData(user, mockUsers)).toBe('email')
    })
    test('returns "space in name"', () => {
        const user = createMockUser({nick: 'duralei duraleev'})
        expect(validateData(user, mockUsers)).toBe('space in name')
    })

    test("returns 'email'", () => {
        const user = createMockUser({email: 'dura dura@mail.ru'})
        expect(validateData(user, mockUsers)).toBe('email')
    })

    test('возвращает "name" для дубликата ника', () => {
        const user = createMockUser({ nick: 'existing' })
        expect(validateData(user, mockUsers)).toBe('name')
    })

    test('возвращает "email" для дубликата email', () => {
        const user = createMockUser({ email: 'test@example.com' })
        expect(validateData(user, mockUsers)).toBe('email')
    })

    test('возвращает "password" для слабого пароля', () => {
        const user = createMockUser({ password: 'weak' })
        expect(validateData(user, mockUsers)).toBe('password')
    })

    test('возвращает "password" для пароля без спецсимвола', () => {
        const user = createMockUser({ password: 'strongpassword123' })
        expect(validateData(user, mockUsers)).toBe('password')
    })
})