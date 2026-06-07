ALTER TABLE `Case` ADD COLUMN `id_organisasi` INTEGER NULL;

CREATE INDEX `Case_id_organisasi_idx` ON `Case`(`id_organisasi`);

ALTER TABLE `Case` ADD CONSTRAINT `Case_id_organisasi_fkey` FOREIGN KEY (`id_organisasi`) REFERENCES `Organisasi`(`id_organisasi`) ON DELETE SET NULL ON UPDATE CASCADE;
