import './styles.css'
import BurgerButton from '../../shared/ui/BurgerButton'
import Image from 'next/image'
import Icon from '@/app/icon.svg'

export default async function Header() {
    return (
        <>
            <header>
                <div className="container">
                    <div className="logo__inner">
                        <Image src={Icon} alt='Chat G icon' title='Chat G' width={60}/>
                        <h2 className="title">CHAT G</h2>
                    </div>
                    <BurgerButton/>
                </div>
            </header>
        </>
    )
}