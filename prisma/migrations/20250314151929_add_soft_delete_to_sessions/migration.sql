-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "invalidated_at" TIMESTAMP(3),
ADD COLUMN     "is_valid" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Session_is_valid_idx" ON "Session"("is_valid");
