
CREATE DATABASE /*!32312 IF NOT EXISTS*/`info` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `info`;

/*Table structure for table `balance` */

DROP TABLE IF EXISTS `financialdata`;

CREATE TABLE `financialdata` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `Date` DATE NOT NULL,
  `Category` VARCHAR(255) NOT NULL,
  `Amount` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`)
);
