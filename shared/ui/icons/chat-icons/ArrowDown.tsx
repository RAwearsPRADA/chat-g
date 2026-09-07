'use client'



export function ArrowDown({scrollToBottom}: {scrollToBottom: () => void}) {
    return <>
    <div className="rounded-full bg-zinc-800 absolute right-10 bottom-15 p-2" onClick={scrollToBottom}>
        <svg 
            xmlns="http://w3.org" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="2.5" 
            stroke="currentColor" 
            className="w-[2em] cursor-pointer text-slate-300 group-hover:text-white transition-colors duration-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
    </>
}