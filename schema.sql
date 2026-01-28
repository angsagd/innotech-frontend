CREATE TABLE workshop (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  instruktur VARCHAR(255),
  afiliasi VARCHAR(255),
  tempat VARCHAR(255),
  kapasitas INT NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE sesi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  waktu DATETIME NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE peserta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  sekolah VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  id_workshop INT NOT NULL,
  id_sesi INT NOT NULL,
  motivasi TEXT,
  instagram VARCHAR(255),
  tiktok VARCHAR(255),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_peserta_workshop FOREIGN KEY (id_workshop) REFERENCES workshop(id),
  CONSTRAINT fk_peserta_sesi FOREIGN KEY (id_sesi) REFERENCES sesi(id)
);
