

CREATE DATABASE IF NOT EXISTS patient_management;

USE patient_management;

CREATE TABLE IF NOT EXISTS patients (
  patient_id INT PRIMARY KEY AUTO_INCREMENT,
  patient_name VARCHAR(100) NOT NULL,
  patient_email VARCHAR(100) NOT NULL,
  patient_phoneno VARCHAR(15) NOT NULL,
  patient_gender VARCHAR(45) NOT NULL,
  patient_age INT NOT NULL,
  patient_problem VARCHAR(300) NOT NULL
);

-- Rename the ID column used by the older schema without affecting new installs.
SET @patient_id_migration = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'patients'
        AND column_name = 'patient-id'
    ),
    'ALTER TABLE patients CHANGE COLUMN `patient-id` patient_id INT NOT NULL AUTO_INCREMENT',
    'SELECT 1'
  )
);
PREPARE patient_id_migration_stmt FROM @patient_id_migration;
EXECUTE patient_id_migration_stmt;
DEALLOCATE PREPARE patient_id_migration_stmt;

-- Keep existing installations compatible with the lengths accepted by the forms.
ALTER TABLE patients
  MODIFY patient_name VARCHAR(100) NOT NULL,
  MODIFY patient_email VARCHAR(100) NOT NULL,
  MODIFY patient_phoneno VARCHAR(15) NOT NULL,
  MODIFY patient_gender VARCHAR(45) NOT NULL,
  MODIFY patient_age INT NOT NULL,
  MODIFY patient_problem VARCHAR(300) NOT NULL;

SELECT * FROM patients;
