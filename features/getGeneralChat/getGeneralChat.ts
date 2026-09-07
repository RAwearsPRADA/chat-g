export async function getGeneralChat(firstUserId: number, secondUserId: number) {
    const response = await fetch('/api/get_general_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstUserId,
            secondUserId
        })
    })
    const data = await response.json()
    return data
}