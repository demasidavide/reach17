CREATE DATABASE  IF NOT EXISTS `corsi_db` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `corsi_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: corsi_db
-- ------------------------------------------------------
-- Server version	5.7.24

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ateneo`
--

DROP TABLE IF EXISTS `ateneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ateneo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ateneo`
--

LOCK TABLES `ateneo` WRITE;
/*!40000 ALTER TABLE `ateneo` DISABLE KEYS */;
INSERT INTO `ateneo` VALUES (23,'Politecnico di Milano'),(24,'Politecnico di Torino'),(18,'Università degli Studi di Bari \"Aldo Moro\"'),(7,'Università degli Studi di Bologna'),(17,'Università degli Studi di Catania'),(14,'Università degli Studi di Firenze'),(15,'Università degli Studi di Genova'),(8,'Università degli Studi di Milano'),(12,'Università degli Studi di Napoli \"Federico II\"'),(10,'Università degli Studi di Padova'),(16,'Università degli Studi di Palermo'),(21,'Università degli Studi di Perugia'),(13,'Università degli Studi di Pisa'),(9,'Università degli Studi di Roma \"La Sapienza\"'),(25,'Università degli Studi di Roma \"Tor Vergata\"'),(26,'Università degli Studi di Salerno'),(22,'Università degli Studi di Siena'),(11,'Università degli Studi di Torino'),(20,'Università degli Studi di Trento'),(19,'Università degli Studi di Verona');
/*!40000 ALTER TABLE `ateneo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `corso`
--

DROP TABLE IF EXISTS `corso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `corso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  `tipologia_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_nome_tipologia` (`nome`,`tipologia_id`),
  KEY `tipologia_id` (`tipologia_id`),
  CONSTRAINT `corso_ibfk_1` FOREIGN KEY (`tipologia_id`) REFERENCES `tipologia_corso` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corso`
--

LOCK TABLES `corso` WRITE;
/*!40000 ALTER TABLE `corso` DISABLE KEYS */;
INSERT INTO `corso` VALUES (6,'Corso Elettrotecnico',12),(10,'Corso Elettrotecnico',13),(5,'Corso Informatico',12),(9,'Corso Informatico',13),(11,'Corso Meccanico',14),(7,'Corso Meccanico',20),(12,'Corso Sanitario',14),(8,'Corso Sanitario',20);
/*!40000 ALTER TABLE `corso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `corso_ateneo`
--

DROP TABLE IF EXISTS `corso_ateneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `corso_ateneo` (
  `corso_id` int(11) NOT NULL,
  `ateneo_id` int(11) NOT NULL,
  PRIMARY KEY (`corso_id`,`ateneo_id`),
  KEY `ateneo_id` (`ateneo_id`),
  CONSTRAINT `corso_ateneo_ibfk_1` FOREIGN KEY (`corso_id`) REFERENCES `corso` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `corso_ateneo_ibfk_2` FOREIGN KEY (`ateneo_id`) REFERENCES `ateneo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corso_ateneo`
--

LOCK TABLES `corso_ateneo` WRITE;
/*!40000 ALTER TABLE `corso_ateneo` DISABLE KEYS */;
/*!40000 ALTER TABLE `corso_ateneo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipologia_corso`
--

DROP TABLE IF EXISTS `tipologia_corso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipologia_corso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipologia_corso`
--

LOCK TABLES `tipologia_corso` WRITE;
/*!40000 ALTER TABLE `tipologia_corso` DISABLE KEYS */;
INSERT INTO `tipologia_corso` VALUES (24,'Corso Blended'),(14,'Corso di Alta Formazione'),(13,'Corso di Perfezionamento'),(12,'Corso di Specializzazione'),(20,'Corso Executive'),(17,'Corso IFTS'),(23,'Corso in Presenza'),(25,'Corso Intensivo'),(16,'Corso ITS'),(22,'Corso Online'),(18,'Corso Post-Diploma'),(19,'Corso Post-Laurea'),(15,'Corso Professionalizzante'),(21,'Corso Serale'),(11,'Dottorato di Ricerca'),(7,'Laurea Magistrale'),(8,'Laurea Magistrale a Ciclo Unico'),(6,'Laurea Triennale'),(9,'Master di I Livello'),(10,'Master di II Livello');
/*!40000 ALTER TABLE `tipologia_corso` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-14 16:36:08
