'use client'

import './styles.css'
import  { useState } from 'react'
import Link from 'next/link'
import type {RegReturnType} from '../../api/reg/route'
import { useRouter } from 'next/navigation'
import { validateData } from '@/shared/lib/validators/validateRegData'
import { ERROR_MESSAGES } from '@/shared/config/errors'


export default function Page() {
    const router = useRouter()
    const [errorType, setErrorType] = useState<string | null>('')    
    const [nick, setNick] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const error = errorType ? ERROR_MESSAGES[errorType]: ''
    
    const regUser = async (): Promise<void> => {
        setIsLoading(true)
        const response = await fetch('/api/reg', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nick,
                email,
                password
            })
        })
        const data: RegReturnType = await response.json()
        if (!data.errorType) 
            router.push('/log-in')
        else if (response.status === 500) {
            setErrorType('Registration error')
        }
        else 
            setErrorType(data.errorType)
        setIsLoading(false)
    }


    return(
        <>
            <div className="page__inner">
                <form action="" id="sign-up"
                onKeyDown={(event: React.KeyboardEvent) => {
                    if (event.key === 'Enter'){ 
                        const error = validateData(nick, email, password)
                        console.log(error)
                        if (!error) {
                            regUser()
                        }
                        else {
                            setErrorType(error)
                        }
                    }
                    }}
                >
                    <label htmlFor="name" title='Name'>Nick</label>
                    {errorType === 'space in name' &&
                        <p className="error-message">Name has not to contain any spaces</p>
                    }
                    {(errorType === 'name' || errorType === 'name length') && 
                        <p className="error-message">{error}</p>
                    }
                    <input type="text" id="name" value={nick} onChange={(event) => {
                        setNick(event.target.value)
                    }}/>
                    <label htmlFor="email" title='Email'>Email</label>
                    {errorType === 'email' &&
                        <p className="error-message">{error}</p>
                    }
                    <input type="text" id="email" value={email} onChange={(event) => {
                        setEmail(event.target.value)
                    }} />
                    <label htmlFor="password" title='Password'>Password</label>
                    {errorType === 'password' &&
                        <p className="error-message">{error}</p>
                    }
                    <input type="password" id="password" value={password} onChange={(event) => {
                        setPassword(event.target.value)
                    }}/>
                    <button  type='button' disabled={isLoading} onClick={() => {
                        const error = validateData(nick, email, password)
                        console.log(error)
                        if (!error)
                            regUser()
                        else setErrorType(error)
                    }}>Sign up</button>
                    <Link href={'/log-in'}>Already has account? Sign in</Link>
                </form>
            </div>
        </>
    )
}