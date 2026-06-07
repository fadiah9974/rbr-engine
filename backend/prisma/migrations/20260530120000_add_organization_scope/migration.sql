ALTER TABLE `User` ADD COLUMN `id_organisasi` INTEGER NULL;

ALTER TABLE `Variabel` ADD COLUMN `id_organisasi` INTEGER NULL;

ALTER TABLE `Kategori` ADD COLUMN `id_organisasi` INTEGER NULL;

ALTER TABLE `Rule` ADD COLUMN `id_organisasi` INTEGER NULL;

CREATE INDEX `User_id_organisasi_idx` ON `User`(`id_organisasi`);

CREATE INDEX `Variabel_id_organisasi_idx` ON `Variabel`(`id_organisasi`);

CREATE UNIQUE INDEX `Variabel_id_organisasi_nama_variabel_key` ON `Variabel`(`id_organisasi`, `nama_variabel`);

CREATE INDEX `Kategori_id_organisasi_idx` ON `Kategori`(`id_organisasi`);

CREATE UNIQUE INDEX `Kategori_id_organisasi_nama_kategori_key` ON `Kategori`(`id_organisasi`, `nama_kategori`);

CREATE INDEX `Rule_id_organisasi_idx` ON `Rule`(`id_organisasi`);

ALTER TABLE `User` ADD CONSTRAINT `User_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Variabel` ADD CONSTRAINT `Variabel_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Kategori` ADD CONSTRAINT `Kategori_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Rule` ADD CONSTRAINT `Rule_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE CASCADE ON UPDATE CASCADE;
