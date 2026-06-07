CREATE TABLE `CaseResult` (
    `id_case_result` INTEGER NOT NULL AUTO_INCREMENT,
    `id_case` INTEGER NOT NULL,
    `id_rule` INTEGER NULL,
    `id_kategori` INTEGER NULL,
    `rekomendasi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `CaseResult_id_case_idx`(`id_case`),
    INDEX `CaseResult_id_rule_idx`(`id_rule`),
    INDEX `CaseResult_id_kategori_idx`(`id_kategori`),
    PRIMARY KEY (`id_case_result`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `CaseResult` (`id_case`, `id_rule`, `id_kategori`, `rekomendasi`, `created_at`, `updated_at`)
SELECT `id_case`, `id_rule`, `id_kategori`, `rekomendasi`, `created_at`, `updated_at`
FROM `Case`
WHERE `id_rule` IS NOT NULL OR `id_kategori` IS NOT NULL OR `rekomendasi` IS NOT NULL;

ALTER TABLE `CaseResult` ADD CONSTRAINT `CaseResult_id_case_fkey` FOREIGN KEY (`id_case`) REFERENCES `Case`(`id_case`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CaseResult` ADD CONSTRAINT `CaseResult_id_rule_fkey` FOREIGN KEY (`id_rule`) REFERENCES `Rule`(`id_rule`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `CaseResult` ADD CONSTRAINT `CaseResult_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `Kategori`(`id_kategori`) ON DELETE SET NULL ON UPDATE CASCADE;
