-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "chatAvatar" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT true;
