'use client'

import { useState } from 'react'
import { SearchedItem } from './search-item/User'
import { SavedChat } from './saved-chats/SavedChat'
import { useSearch } from "../lib/useSearch"
import { SearchItemSkeleton } from '@/shared/ui/skeleton/SearchItemSkeleton'
import { LoadingState } from './states/LoadingState'
import { useBoundStore } from '@/shared/store/store'
import { ConnectionStatusTitle } from './ConnectionStatusTitle'

export default function Sidebar() {
    const savedChats = useBoundStore(s => s.savedChats)
    const chatboxState = useBoundStore(s => s.chatboxState)
    const [searchValue, setSearchValue] = useState<string>('')
    const {results, isLoading, error} = useSearch(searchValue)
    return (
        <>
            <aside 
                className={`${chatboxState? 'hidden sm:block': 'block'} w-full sm:w-75 p-3.75 h-[calc(100vh-100px)] 
                bg-[rgba(49,49,49,0.2)] rounded-r-[15px] overflow-y-auto overflow-x-hidden 
                [&::-webkit-scrollbar]:w-0.75 [&::-webkit-scrollbar-thumb]:bg-[rgb(136,136,136)] [&::-webkit-scrollbar-thumb]:rounded-[3px]
                min-w-0`}>
                <div className="flex flex-col gap-y-3.5 w-full">
                    <div className="search__field ">
                        <input className="w-full border-2 border-solid border-[#0e0000] py-0.75 px-2.5 rounded-[15px] bg-[rgba(102,102,102,0.2)] text-white font-bold " 
                            type="text" id="search" placeholder='Search' value={searchValue} onChange={(event) => {
                            setSearchValue(event.target.value)
                        }} />
                    </div>
                    <ConnectionStatusTitle/>
                    <div className="">
                        <ul className="grid gap-y-1.25 overflow-hidden">
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