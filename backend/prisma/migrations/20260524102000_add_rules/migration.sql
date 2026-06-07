ALTER TABLE `Variabel` MODIFY `tipe_variabel` ENUM('boolean', 'number', 'less_than', 'greater_than', 'equal', 'less_than_equal', 'greater_than_equal') NOT NULL;

CREATE TABLE `Rule` (
    `id_rule` INTEGER NOT NULL AUTO_INCREMENT,
    `id_kategori` INTEGER NOT NULL,
    `rekomendasi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Rule_id_kategori_idx`(`id_kategori`),
    PRIMARY KEY (`id_rule`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RuleDetail` (
    `id_rule_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `id_rule` INTEGER NOT NULL,
    `id_variabel` INTEGER NOT NULL,
    `nilai` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `RuleDetail_id_rule_idx`(`id_rule`),
    INDEX `RuleDetail_id_variabel_idx`(`id_variabel`),
    PRIMARY KEY (`id_rule_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Rule` ADD CONSTRAINT `Rule_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `Kategori`(`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `RuleDetail` ADD CONSTRAINT `RuleDetail_id_rule_fkey` FOREIGN KEY (`id_rule`) REFERENCES `Rule`(`id_rule`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `RuleDetail` ADD CONSTRAINT `RuleDetail_id_variabel_fkey` FOREIGN KEY (`id_variabel`) REFERENCES `Variabel`(`id_variabel`) ON DELETE RESTRICT ON UPDATE CASCADE;
