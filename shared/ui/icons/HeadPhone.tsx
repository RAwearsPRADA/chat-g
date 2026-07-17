export function HeadPhones({className="w-3.5 h-3.5"}: {className?: string}) {
    return <>
        <svg xmlns="http://w3.org" viewBox="0 0 100 100" fill="none" stroke="currentColor" 
        className={className}
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 66 C12 25, 88 25, 88 66" />
    
        <path d="M18 64 C18 34, 82 34, 82 64" />
    
        <path d="M12 66 H18" />
        <path d="M82 66 H88" />
    
        <rect x="15" y="58" width="20" height="32" rx="6" />
        <rect x="22" y="54" width="13" height="40" rx="5" />
    
        <rect x="65" y="58" width="20" height="32" rx="6" />
        <rect x="65" y="54" width="13" height="40" rx="5" />
    
        <path d="M35 74 V84" />
        <path d="M65 54 H71" />
        </svg>
    </>
}