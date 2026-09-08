'use client'

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
            <div className="flex flex-col items-center justify-center gap-y-7.5 h-screen 
                bg-[linear-gradient(45deg,#000,#272727,#8a8a8a,#fff)] bg-size-[300%_300%] animate-background">
                <form action="" className='grid place-items-center gap-y-3.75' id=""
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
                    <label className='cursor-pointer animate-text-animation' htmlFor="name" title='Name'>Nick</label>
                    {errorType === 'space in name' &&
                        <p className="error-message">Name has not to contain any spaces</p>
                    }
                    {(errorType === 'name' || errorType === 'name length') && 
                        <p className="error-message">{error}</p>
                    }
                    <input className='border border-white rounded-[5px] animate-text-animation p-0.5 px-1.25' type="text" id="name" value={nick} onChange={(event) => {
                        setNick(event.target.value)
                    }}/>
                    <label className='cursor-pointer animate-text-animation' htmlFor="email" title='Email'>Email</label>
                    {errorType === 'email' &&
                        <p className="error-message">{error}</p>
                    }
                    <input className='border border-white rounded-[5px] animate-text-animation p-0.5 px-1.25' type="text" id="email" value={email} onChange={(event) => {
                        setEmail(event.target.value)
                    }} />
                    <label className='cursor-pointer animate-text-animation' htmlFor="password" title='Password'>Password</label>
                    {errorType === 'password' &&
                        <p className="error-message">{error}</p>
                    }
                    <input className="border border-white rounded-[5px] animate-text-animation p-0.5 px-1.25 relative
                    after:absolute after:content-['']" type="password" id="password" value={password} onChange={(event) => {
                        setPassword(event.target.value)
                    }}/>
                    <button className='cursor-pointer animate-text-animation'  type='button' disabled={isLoading} onClick={() => {
                        const error = validateData(nick, email, password)
                        if (!error)
                            regUser()
                        else setErrorType(error)
                    }}>Sign up</button>
                    <Link href={'/log-in'}>Already has account? Log in</Link>
                </form>
            </div>
        </>
    )
}