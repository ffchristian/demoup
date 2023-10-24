-- CreateEnum
CREATE TYPE "typeAsset" AS ENUM ('IMAGE', 'VIDEO', 'DOC');

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL DEFAULT '',
    "extension" VARCHAR NOT NULL DEFAULT '',
    "description" VARCHAR NOT NULL DEFAULT '',
    "type" "typeAsset" NOT NULL,
    "location" VARCHAR NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetToCategory" (
    "assetId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "AssetToCategory_pkey" PRIMARY KEY ("assetId","categoryId")
);
