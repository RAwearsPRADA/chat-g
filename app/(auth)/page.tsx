import './styles.css'
import Link from "next/link";
import { validateToken } from '../api/me/route';
import Profile from './Profile';

export default async function Home() {
  const token = await validateToken()
  if (token && token.nick) 
    return <Profile token={token}/>
  return (
    <>
      <div className="page__container">
        <h1 className="page__title">
          Chat G
        </h1>
        <div className="links__inner">
          <Link href={'/log-in'} >Log In</Link>
          <Link href={'/sign-up'} >Sign Up</Link>
        </div>
      </div>
    </>
  );
}
