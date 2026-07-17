export function TrashIcon({onClick, className}: {onClick: () => void, className: string}) {
    return (
        <svg onClick={onClick} className={className} xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}