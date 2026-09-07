export function UserTyping() {
    return  <>
        <div className="flex gap-x-1.25 text-[#afb5ff] text-3">
            <ul className="flex gap-x-0.5 self-center">
                <li className="typing-dot"></li>
                <li className="typing-dot" style={{animation: "TypingAnimation 0.525s ease infinite"}}></li>
                <li className="typing-dot" style={{animation: "TypingAnimation 0.55s ease infinite"}}></li>
            </ul>
            <span>is typing</span>
        </div>
    </>
}