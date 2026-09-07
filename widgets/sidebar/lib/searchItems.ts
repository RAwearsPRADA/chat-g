export const search = (searchValue: string) => { //Поиск по вводу
    const response = fetch('/api/search', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            item: searchValue
        })
    })
    return response
}