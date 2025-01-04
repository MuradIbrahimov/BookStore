-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema bookstoredb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `bookstoredb` ;

-- -----------------------------------------------------
-- Schema bookstoredb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bookstoredb` DEFAULT CHARACTER SET utf8mb3 ;
USE `bookstoredb` ;

-- -----------------------------------------------------
-- Table `bookstoredb`.`admin`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`admin` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`admin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NULL DEFAULT NULL,
  `role` ENUM('admin', 'super_admin') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`author`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`author` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`author` (
  `name` VARCHAR(45) NOT NULL,
  `address` VARCHAR(255) NULL DEFAULT NULL,
  `url` VARCHAR(225) NULL DEFAULT NULL,
  PRIMARY KEY (`name`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`book`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`book` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`book` (
  `isbn` INT NOT NULL,
  `category` VARCHAR(45) NULL DEFAULT NULL,
  `price` VARCHAR(45) NULL DEFAULT NULL,
  `title` VARCHAR(45) NULL DEFAULT NULL,
  `year` INT NULL DEFAULT NULL,
  PRIMARY KEY (`isbn`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`author_book`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`author_book` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`author_book` (
  `author_name` VARCHAR(45) NOT NULL,
  `book_isbn` INT NOT NULL,
  PRIMARY KEY (`author_name`, `book_isbn`),
  INDEX `book_isbn` (`book_isbn` ASC) VISIBLE,
  CONSTRAINT `author_book_ibfk_1`
    FOREIGN KEY (`author_name`)
    REFERENCES `bookstoredb`.`author` (`name`)
    ON DELETE CASCADE,
  CONSTRAINT `author_book_ibfk_2`
    FOREIGN KEY (`book_isbn`)
    REFERENCES `bookstoredb`.`book` (`isbn`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`award`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`award` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`award` (
  `name` VARCHAR(45) NOT NULL,
  `year` INT NULL DEFAULT NULL,
  PRIMARY KEY (`name`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`award_author`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`award_author` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`award_author` (
  `award_name` VARCHAR(255) NOT NULL,
  `author_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`award_name`, `author_name`),
  INDEX `author_name` (`author_name` ASC) VISIBLE,
  CONSTRAINT `award_author_ibfk_1`
    FOREIGN KEY (`award_name`)
    REFERENCES `bookstoredb`.`award` (`name`)
    ON DELETE CASCADE,
  CONSTRAINT `award_author_ibfk_2`
    FOREIGN KEY (`author_name`)
    REFERENCES `bookstoredb`.`author` (`name`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`award_book`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`award_book` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`award_book` (
  `award_name` VARCHAR(255) NOT NULL,
  `book_isbn` INT NOT NULL,
  PRIMARY KEY (`award_name`, `book_isbn`),
  INDEX `book_isbn` (`book_isbn` ASC) VISIBLE,
  CONSTRAINT `award_book_ibfk_1`
    FOREIGN KEY (`award_name`)
    REFERENCES `bookstoredb`.`award` (`name`)
    ON DELETE CASCADE,
  CONSTRAINT `award_book_ibfk_2`
    FOREIGN KEY (`book_isbn`)
    REFERENCES `bookstoredb`.`book` (`isbn`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`awarded_to`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`awarded_to` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`awarded_to` (
  `award_name` VARCHAR(45) NOT NULL,
  `book_isbn` INT NOT NULL,
  PRIMARY KEY (`award_name`, `book_isbn`),
  INDEX `fk_award_has_book_book1_idx` (`book_isbn` ASC) VISIBLE,
  INDEX `fk_award_has_book_award1_idx` (`award_name` ASC) VISIBLE,
  CONSTRAINT `fk_award_has_book_award1`
    FOREIGN KEY (`award_name`)
    REFERENCES `bookstoredb`.`award` (`name`),
  CONSTRAINT `fk_award_has_book_book1`
    FOREIGN KEY (`book_isbn`)
    REFERENCES `bookstoredb`.`book` (`isbn`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`customer`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`customer` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `address` VARCHAR(45) NULL DEFAULT NULL,
  `phone` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`shopping_baskets`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`shopping_baskets` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`shopping_baskets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_date` DATE NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `locked_by` VARCHAR(255) NULL DEFAULT NULL,
  `locked_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `customer_email` (`customer_email` ASC) VISIBLE,
  CONSTRAINT `shopping_baskets_ibfk_1`
    FOREIGN KEY (`customer_email`)
    REFERENCES `bookstoredb`.`customer` (`email`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`contains`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`contains` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`contains` (
  `shopping_basket_id` INT NOT NULL,
  `book_isbn` INT NOT NULL,
  `quantity` INT NOT NULL,
  PRIMARY KEY (`shopping_basket_id`, `book_isbn`),
  INDEX `book_isbn` (`book_isbn` ASC) VISIBLE,
  CONSTRAINT `contains_ibfk_1`
    FOREIGN KEY (`shopping_basket_id`)
    REFERENCES `bookstoredb`.`shopping_baskets` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `contains_ibfk_2`
    FOREIGN KEY (`book_isbn`)
    REFERENCES `bookstoredb`.`book` (`isbn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`warehouses`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`warehouses` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`warehouses` (
  `code` VARCHAR(10) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`code`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`inventory`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`inventory` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`inventory` (
  `warehouse_code` VARCHAR(10) NOT NULL,
  `book_isbn` INT NOT NULL,
  `number` INT NOT NULL,
  PRIMARY KEY (`warehouse_code`, `book_isbn`),
  INDEX `book_isbn` (`book_isbn` ASC) VISIBLE,
  CONSTRAINT `inventory_ibfk_1`
    FOREIGN KEY (`warehouse_code`)
    REFERENCES `bookstoredb`.`warehouses` (`code`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `inventory_ibfk_2`
    FOREIGN KEY (`book_isbn`)
    REFERENCES `bookstoredb`.`book` (`isbn`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`received_by`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`received_by` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`received_by` (
  `award_name` VARCHAR(45) NOT NULL,
  `author_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`award_name`, `author_name`),
  INDEX `fk_award_has_author_author1_idx` (`author_name` ASC) VISIBLE,
  INDEX `fk_award_has_author_award_idx` (`award_name` ASC) VISIBLE,
  CONSTRAINT `fk_award_has_author_author1`
    FOREIGN KEY (`author_name`)
    REFERENCES `bookstoredb`.`author` (`name`),
  CONSTRAINT `fk_award_has_author_award`
    FOREIGN KEY (`award_name`)
    REFERENCES `bookstoredb`.`award` (`name`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`reservation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`reservation` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`reservation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reservation_date` DATE NULL DEFAULT NULL,
  `pickup_time` TIME NULL DEFAULT NULL,
  `customer_email` VARCHAR(45) NOT NULL,
  `book_isbn` INT NOT NULL,
  PRIMARY KEY (`id`, `customer_email`, `book_isbn`),
  INDEX `fk_reservation_customer1_idx` (`customer_email` ASC) VISIBLE,
  INDEX `fk_reservation_book1_idx` (`book_isbn` ASC) VISIBLE,
  CONSTRAINT `fk_reservation_book1`
    FOREIGN KEY (`book_isbn`)
    REFERENCES `bookstoredb`.`book` (`isbn`))
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `bookstoredb`.`sessions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoredb`.`sessions` ;

CREATE TABLE IF NOT EXISTS `bookstoredb`.`sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `admin_id` (`admin_id` ASC) VISIBLE,
  CONSTRAINT `sessions_ibfk_1`
    FOREIGN KEY (`admin_id`)
    REFERENCES `bookstoredb`.`admin` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
