export const SearchItemSkeleton = () => {
    return (
        <li className="flex items-center gap-3 p-2 w-full animate-pulse">
            {/* Аватарка остается круглой */}
            <div className="w-10 h-10 bg-gray-700 rounded-full shrink-0"></div>
            
            <div className="flex flex-col gap-2.5 flex-1 min-w-0 py-1">
                {/* Никнейм: Подлиннее (до 40-50% ширины) и чуть уже по высоте */}
                <div className="h-3.5 bg-gray-600 rounded-md w-[45%]"></div>
                
                {/* Статус/сообщение: Совсем тонкая полоска, подлиннее (до 70%) */}
                <div className="h-2.5 bg-gray-800 rounded-sm w-[70%]"></div>
            </div>
        </li>
    )
}