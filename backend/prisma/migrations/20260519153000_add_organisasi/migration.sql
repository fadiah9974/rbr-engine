-- CreateTable
CREATE TABLE `Organisasi` (
    `id_organisasi` INTEGER NOT NULL AUTO_INCREMENT,
    `instansi` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_organisasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
