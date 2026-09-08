'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePassword } from '@/shared/lib/validators/reg'

export default function LoginForm() {
    const router = useRouter()
    const [login, setLogin] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [errorState, setErrorState] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const validateData = (): boolean => {
        if (login.length < 3) {
            setErrorState(true)
            return false
        }
        if (!validatePassword(password)) {
            setErrorState(true)
            return false
        }
        return true
    }
    const fetchLogin = () => {
        if (!validateData()) return;
        setIsLoading(true)
        const response = fetch('/api/log-in', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login,
                password
            })
        })
        response.then(data => data.json()).then((response: {data: {nick: string, ticket: string, email: string}}) => {
            if (response.data) {
                router.push(`/`)
            }
            else {
                setIsLoading(false)
                setErrorState(true)
            }
        })
    }

    return(
        <>
            <div className="flex flex-col items-center justify-center gap-y-7.5 h-screen 
                bg-[linear-gradient(45deg,#000,#272727,#8a8a8a,#fff)] bg-size-[300%_300%] animate-background">
                <form className='grid place-items-center gap-y-3.75' action="" id="sign-up" onSubmit={(event) => {
                    event.preventDefault()
                    if (validateData()) fetchLogin()
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
                    if (event.key === 'Enter' && validateData()) fetchLogin()
                }}
                >
                    <label className='cursor-pointer animate-text-animation' htmlFor="login" title='Login'>Name or email</label>
                    {!!errorState &&
                    <p className="error-message">Incorrect login or password</p>
                    }
                    <input className='border border-white rounded-[5px] animate-text-animation p-0.5 px-1.25' type="text" id="login" value={login} onChange={(event) => {
                        setLogin(event.target.value)
                    }}/>
                    <label className='cursor-pointer animate-text-animation' htmlFor="password">Password</label>
                    <input className='border border-white rounded-[5px] animate-text-animation p-0.5 px-1.25' type="password" value={password} onChange={(event) => {
                        setPassword(event.target.value)
                    }}/>
                    <button className='cursor-pointer animate-text-animation' type='submit' disabled={isLoading} onClick={() => {
                        if (!validateData()) return;
                        fetchLogin()
                    }}>{isLoading? "Loading..." : "Log in"}</button>
                    <Link href={'/sign-up'}>Do not have account? Sign up</Link>
                </form>
            </div>
        </>
    )
}