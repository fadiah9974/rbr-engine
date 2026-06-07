-- AlterTable
ALTER TABLE `Kategori` ADD COLUMN `id_variabel` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Kategori_id_variabel_idx` ON `Kategori`(`id_variabel`);

-- AddForeignKey
ALTER TABLE `Kategori` ADD CONSTRAINT `Kategori_id_variabel_fkey` FOREIGN KEY (`id_variabel`) REFERENCES `Variabel`(`id_variabel`) ON DELETE SET NULL ON UPDATE CASCADE;
