export function UserTyping() {
    return  <>
        <div className="user__typing">
            <ul>
                <li className="dot" style={{animation: "TypingAnimation 0.5s ease infinite"}}></li>
                <li className="dot" style={{animation: "TypingAnimation 0.525s ease infinite"}}></li>
                <li className="dot" style={{animation: "TypingAnimation 0.55s ease infinite"}}></li>
            </ul>
            <span>is typing</span>
        </div>
    </>
}