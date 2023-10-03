-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.27-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.5.0.6677
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
  `title` varchar(2048) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Available',
  `author` varchar(50) NOT NULL,
  `genre` varchar(50) NOT NULL,
  `borrower` varchar(50) DEFAULT NULL,
  `borrower_number` varchar(50) DEFAULT NULL,
  `date_publicized` varchar(50) NOT NULL,
  `date_added` varchar(50) NOT NULL,
  `date_borrowed` varchar(50) DEFAULT NULL,
  `date_due` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table abtis.books: ~7 rows (approximately)
INSERT INTO `books` (`id`, `title`, `status`, `author`, `genre`, `borrower`, `borrower_number`, `date_publicized`, `date_added`, `date_borrowed`, `date_due`) VALUES
	(0, 'Database Design Mastery: Crafting Efficient Data Solutions', 'Borrowed', 'Karen Roberts', 'Database Management', 'Hannah Velory Revil', 'R20220617550', '15 November 2017', '03 October 2023', '30 September 2023', '2023-09-30'),
	(1, 'Project Management: From Idea to Implementation', 'Borrowed', 'William Foster', 'Project Management', 'Danica Jeanelle Bilaroa', 'R20210005673', '29 September 2023', '24 September 2023', '01 October 2023', '2023-10-27'),
	(2, 'CodeCraft: Mastering Software Development', 'Available', 'Jason Anderson', 'Technology/Programming', NULL, NULL, '15 April 2022', '24 September 2023', NULL, NULL),
	(3, 'Networking Essentials: Connecting the World', 'Available', 'Sarah Johnson', 'Networking', NULL, NULL, '18 May 2019', '24 September 2023', NULL, NULL),
	(4, 'Web Development Wizardry: Building Interactive Web', 'Available', 'David Smith', 'Web Development', NULL, NULL, '22 March 2018', '24 September 2023', NULL, NULL),
	(5, 'Artificial Intelligence Alchemy: Creating Intelligent Systems', 'Available', 'Robert Chang', 'Artificial Intelligence', NULL, NULL, '14 February 2016', '16 May 2023', NULL, NULL),
	(6, 'The DevOps Handbook: Streamlining Software Delivery', 'Available', 'Daniel Mitchell', 'DevOps', NULL, NULL, '05 October 2013', '16 May 2023', NULL, NULL);

-- Dumping structure for table abtis.personnel
CREATE TABLE IF NOT EXISTS `personnel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL DEFAULT '$PersonnelPass123',
  `role` varchar(50) NOT NULL DEFAULT 'Librarian',
  `access_token` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table abtis.personnel: ~2 rows (approximately)
INSERT INTO `personnel` (`id`, `first_name`, `last_name`, `username`, `password`, `role`, `access_token`) VALUES
	(0, 'Librar', 'Ian', 'feurlibrarian', 'feurlibrarian', 'Librarian', NULL),
	(1, 'BROTHER', '', 'feurit', 'feurit', 'IT', NULL);

-- Dumping structure for table abtis.students
CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_number` varchar(50) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Vacant',
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL DEFAULT '$StudentsPass123',
  `borrowed_book` varchar(50) DEFAULT NULL,
  `access_token` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table abtis.students: ~37 rows (approximately)
INSERT INTO `students` (`id`, `student_number`, `phone_number`, `email`, `status`, `first_name`, `last_name`, `password`, `borrowed_book`, `access_token`) VALUES
	(0, 'R20210005673', '09813712123', 'R20210005673@feuroosevelt.edu.ph', 'Borrower', 'Danica Jeanelle', 'Bilaroa', '$Pass123', 'Project Management: From Idea to Implementation', NULL),
	(1, 'R20220134679', '09258577460', 'R20220134679@feuroosevelt.edu.ph', 'Vacant', 'Althea', 'Lauzon', '$Pass123', NULL, NULL),
	(2, 'R20220617550', '09289755334', 'R20220617550@feuroosevelt.edu.ph', 'Borrower', 'Hannah Velory', 'Revil', '$Pass123', 'Database Design Mastery: Crafting Efficient Data S', NULL),
	(3, 'R20220789314', '09061121161', 'R20220789314@feuroosevelt.edu.ph', 'Vacant', 'Tricza Nathanielle', 'Cristi', '$Pass123', NULL, NULL),
	(4, 'R20210004951', '09294476644', 'R20210004951@feuroosevelt.edu.ph', 'Vacant', 'Chriselle Jane', 'Alovera', '$Pass123', NULL, NULL),
	(5, 'R20210005453', '09278566997', 'R20210005453@feuroosevelt.edu.ph ', 'Vacant', 'Mari Alexa', 'Par', '$Pass123', NULL, NULL),
	(6, 'R20210005110', '09052303587', 'R20210005110@feuroosevelt.edu.ph', 'Vacant', 'Gian Carlo', 'Castillo', '$Pass123', NULL, NULL),
	(7, 'R20210004395', '09474918048 ', 'R20210004395@feuroosevelt.edu.ph ', 'Vacant', 'Julius', 'Abad', '$Pass123', NULL, NULL),
	(8, 'R20210004737', '09260189373', 'R20210004737@feuroosevelt.edu.ph', 'Vacant', 'Arkin', 'Manahan', '$Pass123', NULL, NULL),
	(9, 'R20223417887', '09619688337', 'R20223417887@feuroosevelt.edu.ph', 'Vacant', 'Nicole John', 'Paquibot', '$Pass123', NULL, NULL),
	(10, 'R20229717887', '09278964772', 'R20229717887@feuroosevelt.edu.ph', 'Vacant', 'Pia Eunice', 'Torrecampo', '$Pass123', NULL, NULL),
	(11, 'R20210005556', '09155276787', 'R20210005556@feuroosevelt.edu.ph', 'Vacant', 'Hugo Sebastian', 'Vergara', '$Pass123', NULL, NULL),
	(12, 'R20210004198', '09055726284', 'R20210004198@feuroosevelt.edu.ph ', 'Vacant', 'Jericho', 'Frias', '$Pass123', NULL, NULL),
	(13, 'R20171012711', '09691051009', 'R20171012711@feuroosevelt.edu.ph', 'Vacant', 'Lance Christopher', 'Santos', '$Pass123', NULL, NULL),
	(14, 'R2016100580', '09617834997', 'R2016100580@feuroosevelt.edu.ph', 'Vacant', 'Princess Gwyneth', 'Gonzales', '$Pass123', NULL, NULL),
	(15, 'R20220007882', '0927896742', 'R20220007882@feuroosevelt.edu.ph', 'Vacant', 'Jenine', 'Tabaquero', '$Pass123', NULL, NULL),
	(16, 'R20220089747', '09663614800', 'R20220089747@feuroosevelt.edu.ph', 'Vacant', 'Ruo', 'Ishizaka', '$Pass123', NULL, NULL),
	(17, 'R20220071287', '09612876531', 'R20220071287@feuroosevelt.edu.ph', 'Vacant', 'Raphael Edrian', 'Tan', '$Pass123', NULL, NULL),
	(18, 'R20220007887', '09053079542', 'R20220007887@feuroosevelt.edu.ph', 'Vacant', 'Brent Louie', 'Ocop', '$Pass123', NULL, NULL),
	(19, 'R2016100581', '0961579325', 'R2016100581@feuroosevelt.edu.ph', 'Vacant', 'Caysa Claire', 'Junio', '$Pass123', NULL, NULL),
	(20, 'R20210005671', '09156674167', 'R20210005671@feuroosevelt.edu.ph', 'Vacant', 'Joanna Mhel Princess', 'Briones', '$Pass123', NULL, NULL),
	(21, 'R20210004260', '0964782216', 'R20210004260@feuroosevelt.edu.ph', 'Vacant', 'Abegail', 'Gaston', '$Pass123', NULL, NULL),
	(22, 'R20210004952', '09194425993', 'R20210004952@feuroosevelt.edu.ph', 'Vacant', 'Erin Sharika', 'Fernando', '$Pass123', NULL, NULL),
	(23, 'R20210005033', '09615287899', 'R20210005033@feuroosevelt.edu.ph', 'Vacant', 'Juan Antonio', 'Batalla', '$Pass123', NULL, NULL),
	(24, 'R20210004926', '09458635055', 'R20210004926@feuroosevelt.edu.ph', 'Vacant', 'Lindsay Joyce', 'Valencia', '$Pass123', NULL, NULL),
	(25, 'R20210004524', '09995262275', 'R20210004524@feuroosevelt.edu.ph', 'Vacant', 'Kim', 'Masicat', '$Pass123', NULL, NULL),
	(26, 'R2021000185', '09776887014', 'R2021000185@feuroosevelt.edu.ph', 'Vacant', 'Irisch Angelo', 'Cayabyab', '$Pass123', NULL, NULL),
	(27, 'R20220008053', '09064026585', 'R20220008053@feuroosevelt.edu.ph', 'Vacant', 'Kassandra Joyce', 'Domingo', '$Pass123', NULL, NULL),
	(28, 'R20210005636', '09273757647', 'R20210005636@feuroosevelt.edu.ph', 'Vacant', 'Aliyah Faith', 'Liwanag', '$Pass123', NULL, NULL),
	(29, 'R20210005674', '09358448206', 'R20210005674@feuroosevelt.edu.ph', 'Vacant', 'Rachelle Leigh', 'Dumaquita', '$Pass123', NULL, NULL),
	(30, 'R2016100546', '099398856309', 'R2016100546@feuroosevelt.edu.ph', 'Vacant', 'Sam Kian', 'Tan', '$Pass123', NULL, NULL),
	(32, 'R20210001111', '09271405473', 'R20210001111@feuroosevelt.edu.ph', 'Vacant', 'Raien Borgy', 'Dionisi', '$Pass123', NULL, NULL),
	(33, 'R20210002222', '09566695471', 'R20210002222@feuroosevelt.edu.ph', 'Vacant', 'Islam', 'Islam', '$Pass123', NULL, NULL),
	(34, 'R20220007936', '09267353571', 'R20220007936@feuroosevelt.edu.ph', 'Vacant', 'Yesha', 'Sibal', '$Pass123', NULL, NULL),
	(40, 'R20230000000', '09000000000', 'blcpasco@feuroosevelt.edu.ph', 'Vacant', 'Brian Lawrence', 'Pasco', '$StudentsPass123', NULL, NULL),
	(48, 'R20220617550', '09289755334', 'R20220617550@feuroosevelt.edu.ph', 'Vacant', 'Hannah Velory', 'Revil', '$StudentsPass123', NULL, NULL),
	(49, 'R20210005673', '09813712123', 'R20210005673@feuroosevelt.edu.ph', 'Vacant', 'Danica Jeanelle', 'Bilaro', '$StudentsPass123', NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
