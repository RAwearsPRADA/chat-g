import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {  User } from "@/app/generated/prisma/client";
import { validateToken } from "../me/route";
import { Conversation } from "@/app/generated/prisma/client";


export async function findGeneralChat(item: User | Conversation) {
    const token = await validateToken()
    const firstUser = await prisma.user.findFirst({
        where: {
            nick: token?.nick
        },
    })
    if (!item || !firstUser) return;
    if ('nick' in item) {
        if (item.nick === firstUser.nick){ //if it's users's own chat 
            const generalChat = await prisma.conversation.findFirst({ //trying to find
                where: {
                    participants: {
                        every: {userId: firstUser.id},
                        some: {userId: firstUser.id}
                    },
                },
                include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nick: true,
                                name: true,
                                avatar: true
                            }
                        },
                        conversation: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    take: 50
                }
            }
            })
            if (!generalChat) { //if not found
                const newChat = await prisma.conversation.create({ //creating new
                    data: {
                        title: 'Self',
                        participants: {
                            create: [{userId: firstUser.id}]
                        }
                    },
                    include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nick: true,
                                name: true,
                                avatar: true
                            }
                        },
                        conversation: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    take: 50
                }
            }})
            return ( //return new chat
                newChat
            )
        }
            return ( //if was found
                generalChat
            )
        }
        const generalChat = await prisma.conversation.findFirst({ //between two different users
            where: {
                AND: [
                    {participants: {some: {userId: firstUser?.id}}},
                    {participants: {some: {userId: item.id}}}
                ]
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nick: true,
                                name: true,
                                avatar: true
                            }
                        },
                        conversation: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 50
                }
            }
        })
        if (!generalChat) { //if was not found between two different users 
                const newChat = await prisma.conversation.create({ //creating new
                    data: {
                        title: `${item.nick}`,
                        participants: {
                            create: [
                                {userId: firstUser!.id},
                                {userId: item.id}
                            ]
                        }
                    },
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        nick: true,
                                        name: true,
                                        avatar: true
                                    }
                                },
                                conversation: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        },
                        messages: {
                            orderBy: {
                                createdAt: 'asc',
                            },
                            take: 50
                }
                    }
                })
                return ( //return new chat
                    newChat
                )
            }
        else 
            return ( //if was found
                generalChat
            )
    }
    else {
        const chat = await prisma.conversation.findFirst({
            include: {
                messages: {
                    select: {
                        content: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })
    }
}


export async function POST(request: NextRequest): Promise<NextResponse<{
    generalChat: Conversation, 
    chatId: number
}| {message: string}>> {
    const {item}: {item: User | Conversation} = await request.json()
    const generalChat = await findGeneralChat(item)
    if (generalChat) {
        return NextResponse.json({
            generalChat: generalChat,
            chatId: generalChat.id
        })
    }
    return NextResponse.json({
        message: 'error'
    }, {status: 401})
}


