-- CreateTable
CREATE TABLE "public"."ClickEvent" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickEvent_linkId_clickedAt_idx" ON "public"."ClickEvent"("linkId", "clickedAt");

-- AddForeignKey
ALTER TABLE "public"."ClickEvent" ADD CONSTRAINT "ClickEvent_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "public"."Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
