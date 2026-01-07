-- Adjust Transaction to reference Offer instead of Listing
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_listingId_fkey";

-- Add offerId nullable so we can backfill first
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "offerId" TEXT;

-- Backfill offerId from existing listingId using the most recently updated offer on that listing
UPDATE "Transaction" t
SET "offerId" = sub."id"
FROM (
    SELECT o."id", o."listingId"
    FROM "Offer" o
    ORDER BY o."updatedAt" DESC NULLS LAST, o."createdAt" DESC
) sub
WHERE t."offerId" IS NULL
  AND t."listingId" = sub."listingId";

-- Halt migration if any rows remain without an offerId mapping
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Transaction" WHERE "offerId" IS NULL) THEN
        RAISE EXCEPTION 'Cannot migrate: some transactions have no matching offer to backfill offerId.';
    END IF;
END
$$;

-- Enforce NOT NULL, remove legacy listingId, and add constraints
ALTER TABLE "Transaction" ALTER COLUMN "offerId" SET NOT NULL;
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "listingId";

CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_offerId_key" ON "Transaction"("offerId");

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
