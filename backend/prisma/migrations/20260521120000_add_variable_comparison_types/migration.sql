-- AlterTable
ALTER TABLE `Variabel` MODIFY `tipe_variabel` ENUM('boolean', 'number', 'less_than', 'greater_than', 'equal') NOT NULL;
