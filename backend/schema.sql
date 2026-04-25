-- Выполни в MySQL Workbench:
-- File → Open SQL Script → выбери этот файл → Execute (Ctrl+Shift+Enter)

CREATE DATABASE IF NOT EXISTS autoservice_journal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE autoservice_journal;

CREATE TABLE IF NOT EXISTS records (
  id           INT          PRIMARY KEY AUTO_INCREMENT,
  workType     VARCHAR(255) NOT NULL,
  mileage      INT          NOT NULL,
  date         DATE         NOT NULL,
  reminder_time DATETIME    DEFAULT NULL,
  image_url    VARCHAR(500) DEFAULT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Тестовые записи
INSERT INTO records (workType, mileage, date) VALUES
  ('Замена масла',   15200, '2025-10-01'),
  ('Замена фильтра', 15800, '2025-11-15'),
  ('Шиномонтаж',    16300, '2025-12-05');
