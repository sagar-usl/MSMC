-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('REPORTS', 'ACTS', 'POLICIES');

-- CreateEnum
CREATE TYPE "NewsTag" AS ENUM ('SCHEME_UPDATE', 'NOTICE', 'EVENT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT NOT NULL,
    "metaEn" TEXT,
    "metaMr" TEXT,
    "category" "DocumentCategory" NOT NULL,
    "filePath" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_items" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT NOT NULL,
    "descEn" TEXT,
    "descMr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "initiatives" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT NOT NULL,
    "districtEn" TEXT NOT NULL,
    "districtMr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionMr" TEXT,
    "imagePath" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_items" (
    "id" TEXT NOT NULL,
    "tag" "NewsTag" NOT NULL,
    "publishedDate" DATE NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT NOT NULL,
    "snippetEn" TEXT,
    "snippetMr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);
