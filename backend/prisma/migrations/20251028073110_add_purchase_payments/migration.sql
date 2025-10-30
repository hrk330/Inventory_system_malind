-- CreateTable
CREATE TABLE "purchase_payments" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "reference_number" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "processed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "purchase_payments" ADD CONSTRAINT "purchase_payments_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_payments" ADD CONSTRAINT "purchase_payments_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
