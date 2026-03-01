'use client'
import dynamic from "next/dynamic"

export const Rightbar = dynamic(
    () => import('./Sidebar'),
    {
        ssr: false
    }
)