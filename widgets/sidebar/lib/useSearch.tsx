'use client'
import { useState, useEffect, useRef } from "react"
import { search } from "./searchItems"
import { ISearchedUser } from "@/shared/types/ISearchedItem"

export function useSearch(query: string) {
    const [results, setResults] = useState<ISearchedUser[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        if (timerRef.current)
            clearTimeout(timerRef.current)

        if (!query.trim()) {
            setResults([])
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        timerRef.current = setTimeout(async () => {
            try {
                const response = await search(query)
                const data = await response.json()
                setResults(data.searchedItems || [])
            } catch {
                setResults([])
                setError('Something went wrong')
            } finally {
                setIsLoading(false)
            }
        }, 1000)
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [query])
    return {results, isLoading, error}
}