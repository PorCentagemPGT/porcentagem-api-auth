/*
  Warnings:

  - You are about to drop the `password_resets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "device_info" TEXT,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "password_resets";

-- DropTable
DROP TABLE "users";

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
