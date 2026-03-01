import { NextResponse } from "next/server";
import { validateToken } from "../me/route";
import { prisma } from "@/lib/prisma";
import type { ConversationParticipant, Message, User } from "@/app/generated/prisma/client";

export async function GET() {
    const token = await validateToken()
    const savedChats = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    user: {
                        nick: token?.nick
                    }
                }
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        omit: {
                            password: true,
                            email: true
                        }
                    },
            },
        },
        messages: {
            select: {
                content: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 1
        }
}})
    return NextResponse.json({
        savedChats,
        self: token?.nick
    })
}

export interface ISavedChat {
    id: number;
    type: string;
    participants: IChatMember[];
    conversation: {
        id: number,
        createdAt: string;
        updatedAt: string;
    },
    messages: Message[];
    userId: number;
}

interface IChatMember extends ConversationParticipant {
    user: User
}