-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 22, 2023 at 08:57 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `demo_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_chat`
--

CREATE TABLE `tbl_chat` (
  `id` int(11) NOT NULL,
  `chat_room_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_type` varchar(255) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `receiver_type` varchar(255) NOT NULL,
  `message` varchar(255) NOT NULL,
  `message_type` varchar(255) NOT NULL,
  `is_read` enum('read','unread') NOT NULL DEFAULT 'unread',
  `is_active` tinyint(4) NOT NULL DEFAULT 1,
  `is_delete` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_chat`
--

INSERT INTO `tbl_chat` (`id`, `chat_room_id`, `sender_id`, `sender_type`, `receiver_id`, `receiver_type`, `message`, `message_type`, `is_read`, `is_active`, `is_delete`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'user', 2, 'admin', 'hii hello vivek good night', 'text', 'unread', 1, 0, '2023-08-16 09:07:01', '2023-08-16 09:07:01'),
(2, 5, 1, 'user', 2, 'admin', 'hii hello vivek good night', 'text', 'unread', 1, 0, '2023-08-16 09:15:07', '2023-08-16 09:15:07'),
(3, 5, 1, 'user', 2, 'admin', 'hii hello vivek good night', 'text', 'unread', 1, 0, '2023-08-16 09:17:54', '2023-08-16 09:17:54'),
(4, 5, 2, 'user', 1, 'admin', 'hii hello hemang && vivek good night', 'text', 'unread', 1, 0, '2023-08-16 09:18:46', '2023-08-16 09:18:46'),
(5, 5, 2, 'user', 1, 'admin', 'hii hello hemang && vivek good night', 'text', 'unread', 1, 0, '2023-08-16 09:29:11', '2023-08-16 09:29:11'),
(6, 5, 2, 'user', 1, 'admin', 'hii hello hemang && vivek good night', 'text', 'unread', 1, 0, '2023-08-16 09:29:41', '2023-08-16 09:29:41'),
(7, 5, 2, 'user', 1, 'admin', 'hii hello hemang && vivek good night', 'text', 'unread', 1, 0, '2023-08-16 10:00:00', '2023-08-16 10:00:00'),
(8, 5, 2, 'user', 1, 'admin', 'hii hello good night', 'text', 'read', 1, 0, '2023-08-16 10:00:56', '2023-08-16 13:58:58'),
(13, 8, 3, 'user', 1, 'admin', 'Heloo Amarjit', 'text', 'read', 1, 0, '2023-08-22 06:51:40', '2023-08-22 06:56:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_chat`
--
ALTER TABLE `tbl_chat`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_chat`
--
ALTER TABLE `tbl_chat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
