-- CreateTable
CREATE TABLE "public"."RagSource" (
    "source_id" TEXT NOT NULL,
    "filename" TEXT,
    "title" TEXT,
    "author" TEXT,
    "year" INTEGER,
    "edition" TEXT,
    "publisher" TEXT,
    "source_url" TEXT,

    CONSTRAINT "RagSource_pkey" PRIMARY KEY ("source_id")
);
