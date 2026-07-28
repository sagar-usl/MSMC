-- AlterTable: education items can now have an optional attached document
ALTER TABLE "education_items" ADD COLUMN "filePath" TEXT;

-- AlterTable: initiatives move from a single image to a gallery (see
-- initiative_images below) — no existing rows have imagePath set, so this
-- is a plain drop, nothing to migrate.
ALTER TABLE "initiatives" DROP COLUMN "imagePath";

-- CreateTable
CREATE TABLE "initiative_images" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "initiative_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "initiative_images" ADD CONSTRAINT "initiative_images_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
