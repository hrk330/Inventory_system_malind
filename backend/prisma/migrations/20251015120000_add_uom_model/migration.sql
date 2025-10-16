-- CreateTable
CREATE TABLE "uoms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uoms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uoms_symbol_key" ON "uoms"("symbol");

-- Insert default UOMs first
INSERT INTO "uoms" ("id", "name", "symbol", "description", "is_active", "created_at", "updated_at") VALUES
('uom-pcs', 'Pieces', 'pcs', 'Individual items', true, NOW(), NOW()),
('uom-kg', 'Kilograms', 'kg', 'Weight measurement', true, NOW(), NOW()),
('uom-g', 'Grams', 'g', 'Weight measurement', true, NOW(), NOW()),
('uom-l', 'Liters', 'l', 'Volume measurement', true, NOW(), NOW()),
('uom-ml', 'Milliliters', 'ml', 'Volume measurement', true, NOW(), NOW()),
('uom-m', 'Meters', 'm', 'Length measurement', true, NOW(), NOW()),
('uom-cm', 'Centimeters', 'cm', 'Length measurement', true, NOW(), NOW()),
('uom-box', 'Box', 'box', 'Packaging unit', true, NOW(), NOW()),
('uom-pack', 'Pack', 'pack', 'Packaging unit', true, NOW(), NOW());

-- Add uom_id column as nullable first
ALTER TABLE "products" ADD COLUMN "uom_id" TEXT;

-- Update existing products to use 'pcs' UOM
UPDATE "products" SET "uom_id" = 'uom-pcs' WHERE "uom_id" IS NULL;

-- Now make uom_id NOT NULL
ALTER TABLE "products" ALTER COLUMN "uom_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
