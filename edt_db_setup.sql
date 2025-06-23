DROP DATABASE IF EXISTS edt_db;
CREATE DATABASE IF NOT EXISTS edt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE edt_db;

-- Table des blocs de séances
CREATE TABLE `BlocSeance` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(16) COMMENT 'ex: MP2I, G7, TD_math_1, opt_si',
  `prio` INT COMMENT '0 z-layer basse et 10 z-layer haute ...'
) COMMENT = 'Groupe de séance';

-- Table des groupes d'élèves
CREATE TABLE `Groupe` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(16) COMMENT 'ex: MP2I, G7, TD_math_1, opt_si'
) COMMENT = 'Groupe d''eleve';

-- Table des élèves
CREATE TABLE `Eleve` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(16),
  `prenom` VARCHAR(16),
  `password_hash` VARCHAR(255) COMMENT 'Mot de passe chiffré'
);

-- Association élève-groupe
CREATE TABLE `Eleve_Groupe` (
  `eleve_id` INT,
  `groupe_id` INT,
  PRIMARY KEY (`eleve_id`, `groupe_id`),
  FOREIGN KEY (`eleve_id`) REFERENCES `Eleve` (`id`),
  FOREIGN KEY (`groupe_id`) REFERENCES `Groupe` (`id`)
) COMMENT = 'L''élève E est dans le groupe G';

-- Association bloc-groupe
CREATE TABLE `BlocSeance_Groupe` (
  `bloc_id` INT,
  `groupe_id` INT,
  `semaine` INT COMMENT '0 si pour toutes les semaines',
  PRIMARY KEY (`bloc_id`, `groupe_id`),
  FOREIGN KEY (`bloc_id`) REFERENCES `BlocSeance` (`id`),
  FOREIGN KEY (`groupe_id`) REFERENCES `Groupe` (`id`)
) COMMENT = 'le groupe G suit les seances du bloc B la semaine N';

-- Table des séances
CREATE TABLE `Seance` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `couleur_id` INT,
  `date_initiale` DATE,
  `date_fin` DATE,
  `recurrence_jours` INT COMMENT '0 = ponctuelle, sinon nombre de jours entre répétitions',
  `heure_debut` TIME,
  `heure_fin` TIME,
  `salle` VARCHAR(16),
  `bloc_id` INT,
  `enseignant` VARCHAR(16),
  `matiere` VARCHAR(16),
  FOREIGN KEY (`bloc_id`) REFERENCES `BlocSeance` (`id`)
);
