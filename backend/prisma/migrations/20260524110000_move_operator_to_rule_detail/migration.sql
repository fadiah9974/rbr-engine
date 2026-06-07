ALTER TABLE `RuleDetail` ADD COLUMN `operator` ENUM('equal', 'less_than', 'greater_than', 'less_than_equal', 'greater_than_equal') NOT NULL DEFAULT 'equal';

UPDATE `RuleDetail`
INNER JOIN `Variabel` ON `RuleDetail`.`id_variabel` = `Variabel`.`id_variabel`
SET `RuleDetail`.`operator` = `Variabel`.`tipe_variabel`
WHERE `Variabel`.`tipe_variabel` IN ('less_than', 'greater_than', 'less_than_equal', 'greater_than_equal', 'equal');

UPDATE `Variabel`
SET `tipe_variabel` = 'number'
WHERE `tipe_variabel` IN ('less_than', 'greater_than', 'less_than_equal', 'greater_than_equal', 'equal');

ALTER TABLE `Variabel` MODIFY `tipe_variabel` ENUM('boolean', 'number') NOT NULL;
