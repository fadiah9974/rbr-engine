ALTER TABLE `Variabel` DROP FOREIGN KEY `Variabel_id_organisasi_fkey`;

ALTER TABLE `Kategori` DROP FOREIGN KEY `Kategori_id_organisasi_fkey`;

ALTER TABLE `Rule` DROP FOREIGN KEY `Rule_id_organisasi_fkey`;

ALTER TABLE `Variabel` ADD CONSTRAINT `Variabel_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Kategori` ADD CONSTRAINT `Kategori_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Rule` ADD CONSTRAINT `Rule_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE SET NULL ON UPDATE CASCADE;
