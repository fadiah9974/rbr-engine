CREATE TABLE `Case` (
    `id_case` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `id_rule` INTEGER NULL,
    `id_kategori` INTEGER NULL,
    `nama_asesi` VARCHAR(191) NOT NULL,
    `rekomendasi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Case_id_user_idx`(`id_user`),
    INDEX `Case_id_rule_idx`(`id_rule`),
    INDEX `Case_id_kategori_idx`(`id_kategori`),
    PRIMARY KEY (`id_case`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CaseAnswer` (
    `id_case_answer` INTEGER NOT NULL AUTO_INCREMENT,
    `id_case` INTEGER NOT NULL,
    `id_variabel` INTEGER NOT NULL,
    `nilai` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `CaseAnswer_id_case_idx`(`id_case`),
    INDEX `CaseAnswer_id_variabel_idx`(`id_variabel`),
    PRIMARY KEY (`id_case_answer`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Case` ADD CONSTRAINT `Case_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Case` ADD CONSTRAINT `Case_id_rule_fkey` FOREIGN KEY (`id_rule`) REFERENCES `Rule`(`id_rule`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Case` ADD CONSTRAINT `Case_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `Kategori`(`id_kategori`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `CaseAnswer` ADD CONSTRAINT `CaseAnswer_id_case_fkey` FOREIGN KEY (`id_case`) REFERENCES `Case`(`id_case`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CaseAnswer` ADD CONSTRAINT `CaseAnswer_id_variabel_fkey` FOREIGN KEY (`id_variabel`) REFERENCES `Variabel`(`id_variabel`) ON DELETE RESTRICT ON UPDATE CASCADE;
