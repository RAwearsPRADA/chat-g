'use client'

import './styles.css'
import { useState } from 'react'
import { SearchedItem } from './search-item/User'
import { SavedChat } from './saved-chats/SavedChat'
import { useSearch } from "../lib/useSearch"
import { SearchItemSkeleton } from '@/shared/ui/skeleton/SearchItemSkeleton'
import { LoadingState } from './states/LoadingState'
import { useBoundStore } from '@/shared/store/store'
import { ConnectionStatusTitle } from './ConnectionStatusTtile'

export default function Sidebar() {
    const savedChats = useBoundStore(s => s.savedChats)
    const [searchValue, setSearchValue] = useState<string>('')
    const {results, isLoading, error} = useSearch(searchValue)
    return (
        <>
            <aside className='sidebar'>
                <div className="sidebar__inner">
                    <div className="search__field">
                        <input type="text" id="search" placeholder='Search' value={searchValue} onChange={(event) => {
                            setSearchValue(event.target.value)
                        }} />
                    </div>
                    <ConnectionStatusTitle/>
                    <div className="chats__container">
                        <ul className="chats__inner">
                            {isLoading && 
                                <>
                                    <LoadingState/>
                                    <SearchItemSkeleton />
                                    <SearchItemSkeleton />
                                    <SearchItemSkeleton />
                                </>
                            }
                            {!!error?.length &&
                                <p className="search-error">{error}</p>
                            }
                            {!!(results.length && !isLoading) && (results.map(item => 
                                <SearchedItem key={item.id} userData={item}/>
                            ))
                            }
                            {(!!savedChats.length && !searchValue) && savedChats.map(chat => 
                                <SavedChat chat={chat} key={chat.chatId}/>
                            )}
                        </ul>
                    </div>
                </div>
            </aside>
        </>
    )
}