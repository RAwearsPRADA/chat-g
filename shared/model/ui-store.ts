import {create} from 'zustand'


interface StoreInterface {
    drawerState: boolean,
    switchDrawerState: () => void
}

export const useUIStore = create<StoreInterface>(set => ({
    drawerState: false,
    switchDrawerState: () => set((state) => ({
        drawerState: !state.drawerState
    })),
}))