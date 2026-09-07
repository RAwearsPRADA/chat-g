import BurgerButton from '../../shared/ui/BurgerButton'
import Image from 'next/image'
import Icon from '@/app/icon.svg'

export default async function Header() {
    return (
        <>
            <header className="relative z-100 flex justify-between items-center bg-[#131313] w-full h-25 shadow-[1px 10px 1px #d8d8d8] shadow-[0_1px_0_0_rgba(255,255,255,0.1)]">
                <div className="flex justify-between items-center w-[80%] mx-auto">
                    <div className="sm:text-[32px] flex items-center gap-x-3.75 text-[28px] px-3.75 font-['Bitcount_Single',sans-serif]">
                        <Image src={Icon} alt='Chat G icon' title='Chat G' width={60}/>
                        <h2 className="title">CHAT G</h2>
                    </div>
                    <BurgerButton/>
                </div>
            </header>
        </>
    )
}