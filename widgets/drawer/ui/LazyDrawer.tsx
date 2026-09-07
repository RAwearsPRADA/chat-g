import dynamic from "next/dynamic"

export const LazyDrawer = dynamic(
    () => import('./Drawer'),
    {
        ssr: false,
        loading: () => null
    }
)