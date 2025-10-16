-- CreateTable
CREATE TABLE "bulk_import_records" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_records" INTEGER NOT NULL,
    "successful_records" INTEGER NOT NULL,
    "failed_records" INTEGER NOT NULL,
    "errors" TEXT[],
    "user_id" TEXT NOT NULL,
    "summary" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "bulk_import_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bulk_import_records" ADD CONSTRAINT "bulk_import_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
