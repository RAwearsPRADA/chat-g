'use client'

import '../sign-up/styles.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePassword } from '@/lib/validators/reg'

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
        response.then(data => data.json()).then(data => {
            if (data.data) router.push(`/`)
            else {
                setIsLoading(false)
                setErrorState(true)
            }
        })
    }

    return(
        <>
            <div className="page__inner">
                <form action="" id="sign-up" onSubmit={(event) => {
                    event.preventDefault()
                    if (validateData()) fetchLogin()
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLFormElement>) => {
                    if (event.key === 'Enter' && validateData()) fetchLogin()
                }}
                >
                    <label htmlFor="login" title='Login'>Name or email</label>
                    {!!errorState &&
                    <p className="error-message">Incorrect login or password</p>
                    }
                    <input type="text" id="login" value={login} onChange={(event) => {
                        setLogin(event.target.value)
                    }}/>
                    <label htmlFor="password">Password</label>
                    <input type="password" value={password} onChange={(event) => {
                        setPassword(event.target.value)
                    }}/>
                    <button  type='submit' disabled={isLoading} onClick={() => {
                        if (!validateData()) return;
                        fetchLogin()
                    }}>{isLoading? "Loading..." : "Log in"}</button>
                    <Link href={'/sign-up'}>Do not have accout? Sign up</Link>
                </form>
            </div>
        </>
    )
}