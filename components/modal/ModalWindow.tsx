import './styles.css'
import { createPortal } from 'react-dom'

export function ModalWindow({text, isOpened}: {text: string, isOpened: boolean}) {
    if (isOpened)
    return (
        <>
            <div className="modal__container">
                <p className="message">{text}</p>
            </div>
        </>
    )
    else return
}