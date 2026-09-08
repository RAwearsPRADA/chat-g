'use server'

import Link from "next/link";
import { validateToken } from '@/shared/lib/validate-token/validateToken';
import Profile from './Profile';

export default async function Home() {
    const token = await validateToken()
    if (token && token.nick) 
      return <Profile token={token}/>
    return (
      <>
        <div className="flex flex-col min-h-screen justify-center content-center flex-wrap font-bold 
        bg-[linear-gradient(90deg,#0a0a0a,#1a1a1a,#2a2a2a,#1a1a1a,#0a0a0a)] bg-size-[400%_400%] animate-gradient-flicker">
          <h1 className="text-[32px] text-center bg-[linear-gradient(90deg,#1d1c1f,#6e6e6e,#fff,#e2e2e2)] 
           bg-position-[300%_300%]
           bg-clip-text 
           text-transparent 
           animate-text-flicker">
            Chat G
          </h1>
          <div className="relative flex text-[24px] gap-x-5 self-[normal] shadow-[none] rounded-[15px] bg-transparent ">
            <Link className='main-page-link' href={'/log-in'} >Log In</Link>
            <Link className='main-page-link' href={'/sign-up'} >Sign Up</Link>
          </div>
        </div>
      </>
    );
}
