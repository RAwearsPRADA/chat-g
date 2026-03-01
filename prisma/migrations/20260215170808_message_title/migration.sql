/*
  Warnings:

  - You are about to drop the column `key` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Conversation_key_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "key",
ADD COLUMN     "title" TEXT;
