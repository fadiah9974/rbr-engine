-- DropForeignKey
ALTER TABLE `Kategori` DROP FOREIGN KEY `Kategori_id_variabel_fkey`;

-- DropIndex
DROP INDEX `Kategori_id_variabel_idx` ON `Kategori`;

-- AlterTable
ALTER TABLE `Kategori` DROP COLUMN `id_variabel`;
