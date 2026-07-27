-- RenameEnumValue: FIRST now means "any non-final hearing" (INTERIM), not
-- just the first one — use RENAME VALUE (not drop+add) so existing rows
-- keep their data.
ALTER TYPE "HearingKind" RENAME VALUE 'FIRST' TO 'INTERIM';

-- AlterTable: attachmentPath was never populated by any real flow (no
-- upload UI existed yet) — replaced by the complaint_attachments table below.
ALTER TABLE "complaints" DROP COLUMN "attachmentPath";

-- CreateTable
CREATE TABLE "complaint_attachments" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "complaint_attachments" ADD CONSTRAINT "complaint_attachments_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
