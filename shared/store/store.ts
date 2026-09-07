import type { ChatSlice } from "./slices/chatSlice";
import type { WSSlice } from "./slices/wsSlice";
import type { ObserverSlice } from "./slices/ObserverSlice";
import { create } from "zustand";
import { createWSSlice } from "./slices/wsSlice";
import { createChatSlice } from "./slices/chatSlice";
import { createObserverSlice } from "./slices/ObserverSlice";


type BoundStore = ChatSlice & WSSlice & ObserverSlice

export const useBoundStore = create<BoundStore>()((...a) => ({
   ...createChatSlice(...a),
   ...createWSSlice(...a),
   ...createObserverSlice(...a)
}))