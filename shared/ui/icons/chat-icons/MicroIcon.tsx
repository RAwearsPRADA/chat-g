export function MicroIcon({onClick, className}: {onClick: () => void, className: string}) {
    return (
        <svg onClick={onClick} className={className}
            xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="none">
            <rect x="8" y="2" width="8" height="12" rx="4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M4 11c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>

    )
}