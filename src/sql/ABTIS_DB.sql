-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.27-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.4.0.6659
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for abtis
CREATE DATABASE IF NOT EXISTS `abtis` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `abtis`;

-- Dumping structure for table abtis.books
CREATE TABLE IF NOT EXISTS `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `author` varchar(50) NOT NULL,
  `genre` varchar(50) NOT NULL,
  `borrower` varchar(50) DEFAULT NULL,
  `borrower_number` varchar(50) DEFAULT NULL,
  `date_publicized` varchar(50) NOT NULL,
  `date_added` varchar(50) NOT NULL,
  `date_borrowed` varchar(50) DEFAULT NULL,
  `date_due` varchar(50) DEFAULT NULL,
  `duration_due` int(11) DEFAULT NULL,
  `duration_borrowed` int(11) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table abtis.books: ~20 rows (approximately)
INSERT INTO `books` (`id`, `title`, `author`, `genre`, `borrower`, `borrower_number`, `date_publicized`, `date_added`, `date_borrowed`, `date_due`, `duration_due`, `duration_borrowed`, `status`) VALUES
	(1, 'Book #1', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(2, 'Book #2', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(3, 'Book #3', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(4, 'Book #4', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(5, 'Book #5', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(6, 'Book #6', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(7, 'Book #7', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(8, 'Book #8', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(9, 'Book #9', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(10, 'Book #10', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(11, 'Book #11', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(12, 'Book #12', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(13, 'Book #13', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(14, 'Book #14', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(15, 'Book #15', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(16, 'Book #16', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(17, 'Book #17', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(18, 'Book #18', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(19, 'Book #19', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available'),
	(20, 'Book #20', 'John Doe', 'Placeholder', NULL, NULL, '16 May 2023', '2023-05-16 00:00:00', NULL, NULL, NULL, NULL, 'available');

-- Dumping structure for table abtis.students
CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_number` varchar(50) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table abtis.students: ~34 rows (approximately)
INSERT INTO `students` (`id`, `student_number`, `phone_number`, `email`, `first_name`, `last_name`) VALUES
	(1, 'R20220134679', '09258577460', 'R20220134679@feuroosevelt.edu.ph', 'Althea Marielle', 'Lauzon'),
	(2, 'R20220617550', '09289755334', 'R20220617550@feuroosevelt.edu.ph', 'Hannah Velory', 'Revil'),
	(3, 'R20220789314', '09061121161', 'R20220789314@feuroosevelt.edu.ph', 'Tricza Nathanielle', 'Cristi'),
	(4, 'R20210004951', '09294476644', 'R20210004951@feuroosevelt.edu.ph', 'Chriselle Jane', 'Alovera'),
	(5, 'R20210005453', '09278566997', 'R20210005453@feuroosevelt.edu.ph ', 'Mari Alexa', 'Par'),
	(6, 'R20210005110', '09052303587', 'R20210005110@feuroosevelt.edu.ph', 'Gian Carlo', 'Castillo'),
	(7, 'R20210004395', '09474918048 ', 'R20210004395@feuroosevelt.edu.ph ', 'Julius', 'Abad'),
	(8, 'R20210004737', '09260189373', 'R20210004737@feuroosevelt.edu.ph', 'Arkin', 'Manahan'),
	(9, 'R20223417887', '09619688337', 'R20223417887@feuroosevelt.edu.ph', 'Nicole John', 'Paquibot'),
	(10, 'R20229717887', '09278964772', 'R20229717887@feuroosevelt.edu.ph', 'Pia Eunice', 'Torrecampo'),
	(11, 'R20210005556', '09155276787', 'R20210005556@feuroosevelt.edu.ph', 'Hugo Sebastian', 'Vergara'),
	(12, 'R20210004198', '09055726284', 'R20210004198@feuroosevelt.edu.ph ', 'Jericho', 'Frias'),
	(13, 'R20171012711', '09691051009', 'R20171012711@feuroosevelt.edu.ph', 'Lance Christopher', 'Santos'),
	(14, 'R2016100580', '09617834997', 'R2016100580@feuroosevelt.edu.ph', 'Princess Gwyneth', 'Gonzales'),
	(15, 'R20220007882', '0927896742', 'R20220007882@feuroosevelt.edu.ph', 'Jenine', 'Tabaquero'),
	(16, 'R20220089747', '09663614800', 'R20220089747@feuroosevelt.edu.ph', 'Ruo', 'Ishizaka'),
	(17, 'R20220071287', '09612876531', 'R20220071287@feuroosevelt.edu.ph', 'Raphael Edrian', 'Tan'),
	(18, 'R20220007887', '09053079542', 'R20220007887@feuroosevelt.edu.ph', 'Brent Louie', 'Ocop'),
	(19, 'R2016100581', '0961579325', 'R2016100581@feuroosevelt.edu.ph', 'Caysa Claire', 'Junio'),
	(20, 'R20210005671', '09156674167', 'R20210005671@feuroosevelt.edu.ph', 'Joanna Mhel Princess', 'Briones'),
	(21, 'R20210004260', '0964782216', 'R20210004260@feuroosevelt.edu.ph', 'Abegail', 'Gaston'),
	(22, 'R20210004952', '09194425993', 'R20210004952@feuroosevelt.edu.ph', 'Erin Sharika', 'Fernando'),
	(23, 'R20210005033', '09615287899', 'R20210005033@feuroosevelt.edu.ph', 'Juan Antonio', 'Batalla'),
	(24, 'R20210004926', '09458635055', 'R20210004926@feuroosevelt.edu.ph', 'Lindsay Joyce', 'Valencia'),
	(25, 'R20210004524', '09995262275', 'R20210004524@feuroosevelt.edu.ph', 'Kim', 'Masicat'),
	(26, 'R2021000185', '09776887014', 'R2021000185@feuroosevelt.edu.ph', 'Irisch Angelo', 'Cayabyab'),
	(27, 'R20220008053', '09064026585', 'R20220008053@feuroosevelt.edu.ph', 'Kassandra Joyce', 'Domingo'),
	(28, 'R20210005636', '09273757647', 'R20210005636@feuroosevelt.edu.ph', 'Aliyah Faith', 'Liwanag'),
	(29, 'R20210005674', '09358448206', 'R20210005674@feuroosevelt.edu.ph', 'Rachelle Leigh', 'Dumaquita'),
	(30, 'R2016100546', '099398856309', 'R2016100546@feuroosevelt.edu.ph', 'Sam Kian', 'Tan'),
	(31, 'R20210005673', '09813712123', 'R20210005673@feuroosevelt.edu.ph', 'Danica Jeanelle', 'Bilaro'),
	(32, 'R20210001111', '09271405473', 'R20210001111@feuroosevelt.edu.ph', 'Raien Borgy', 'Dionisi'),
	(33, 'R20210002222', '09566695471', 'R20210002222@feuroosevelt.edu.ph', 'Islam', 'Islam'),
	(34, 'R20220007936', '09267353571', 'R20220007936@feuroosevelt.edu.ph', 'Yesha', 'Sibal');

-- Dumping structure for table abtis.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table abtis.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`) VALUES
	(1, 'bro', 'bro'),
	(2, 'FEURLIBRARIANSTAFF', 'Placeholder2');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
