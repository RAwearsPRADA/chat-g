export function StopIcon({onClick, className}: {onClick: () => void, className: string}) {
    return (
        <svg onClick={onClick} className={className} xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M9 6v12M15 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>

    )
}