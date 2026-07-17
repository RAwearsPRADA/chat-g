import { User } from "@/app/generated/prisma/client";

export interface ISearchedUser extends User {
    isOnline: boolean
}