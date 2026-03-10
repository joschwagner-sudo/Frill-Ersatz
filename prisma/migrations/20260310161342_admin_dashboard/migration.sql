-- AlterTable
ALTER TABLE "FeatureRequest" ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'NEEDS_APPROVAL',
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShortlisted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "number" SERIAL NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaTopics" (
    "id" TEXT NOT NULL,
    "featureRequestId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "IdeaTopics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaTopics_featureRequestId_idx" ON "IdeaTopics"("featureRequestId");

-- CreateIndex
CREATE INDEX "IdeaTopics_topicId_idx" ON "IdeaTopics"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaTopics_featureRequestId_topicId_key" ON "IdeaTopics"("featureRequestId", "topicId");

-- CreateIndex
CREATE INDEX "FeatureRequest_approvalStatus_idx" ON "FeatureRequest"("approvalStatus");

-- CreateIndex
CREATE INDEX "FeatureRequest_number_idx" ON "FeatureRequest"("number");

-- AddForeignKey
ALTER TABLE "IdeaTopics" ADD CONSTRAINT "IdeaTopics_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaTopics" ADD CONSTRAINT "IdeaTopics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
