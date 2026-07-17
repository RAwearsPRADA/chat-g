export function ResumeIcon({onClick, className}: {onClick: () => void, className: string}) {
    return (
        <svg onClick={onClick} className={className} xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M7 4v16l12-8L7 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}