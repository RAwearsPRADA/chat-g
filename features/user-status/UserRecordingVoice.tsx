export function UserRecordingVoice() {
    return (
        <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-5 h-5">
                
                <div className="absolute w-full h-full rounded-full border-2 border-blue-400/40 bg-blue-500/10 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_infinite] scale-[0.5]" />
                
                <div className="absolute w-full h-full rounded-full border-2 border-blue-400/40 bg-blue-500/10 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_infinite_0.45s] scale-[0.5]" />
                
                <div className="absolute w-full h-full rounded-full border-2 border-blue-400/40 bg-blue-500/10 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_infinite_0.9s] scale-[0.5]" />
                
                <svg 
                    className="relative z-10 w-3.5 h-3.5 text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.7)]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <rect x="8" y="2" width="8" height="12" rx="4" />
                    
                    <line x1="8" y1="5.5" x2="11" y2="5.5" />
                    <line x1="13" y1="5.5" x2="16" y2="5.5" />
                    
                    <line x1="8" y1="8" x2="11" y2="8" />
                    <line x1="13" y1="8" x2="16" y2="8" />
                    
                    <line x1="8" y1="10.5" x2="11" y2="10.5" />
                    <line x1="13" y1="10.5" x2="16" y2="10.5" />
                    
                    <path d="M5 9v1a7 7 0 0 0 14 0V9" />
                    
                    <line x1="12" y1="17" x2="12" y2="21" />
                    
                    <path d="M7 21h10" strokeWidth="3" />
                </svg>
            </div>
            
            <span className="text-blue-400 text-sm font-medium">is recording voice</span>
        </div>
    )
}
