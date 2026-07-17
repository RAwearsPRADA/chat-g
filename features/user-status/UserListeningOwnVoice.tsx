import { HeadPhones } from "../../shared/ui/icons/HeadPhone";

export function UserListeningOwnVoice() {
    return (
        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium transition-all duration-300">
            {/* Твоя минималистичная иконка с мягкой пульсацией */}
            <div className="relative flex items-center justify-center animate-pulse">
                <HeadPhones className="w-3.5 h-3.5" />
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-25 animate-ping" />
            </div>
            
            {/* Текст статуса на английском */}
            <span className="tracking-wide lowercase first-letter:uppercase">
                listening own voice
            </span>
            
            {/* Три минималистичные прыгающие полоски звуковой волны */}
            <div className="flex items-end gap-0.5 h-3 ml-0.5 pb-0.5">
                <span className="w-[1.5px] bg-emerald-500 rounded-full animate-[bounce_1s_infinite_100ms] h-1.5" />
                <span className="w-[1.5px] bg-emerald-500 rounded-full animate-[bounce_1s_infinite_300ms] h-2.5" />
                <span className="w-[1.5px] bg-emerald-500 rounded-full animate-[bounce_1s_infinite_200ms] h-2" />
            </div>
        </div>
    );
}