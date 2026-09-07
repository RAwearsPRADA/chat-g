'use client'

import { useBoundStore } from '@/shared/store/store';
import { PrivateChat } from './PrivateChat';
import { GroupChat } from './GroupChat';
import { SavedChat } from './SavedChat';

export function Chatbox() {
    const self = useBoundStore(s => s.self)
    const chatboxState = useBoundStore(s => s.chatboxState)
    if (!chatboxState || !self) 
        return null;
    if (chatboxState.type === 'PRIVATE') 
        return <PrivateChat/>
    else if (chatboxState.type === 'SAVED')
        return <SavedChat/>
    else 
        return <GroupChat/>
}
