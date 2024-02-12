CREATE DATABASE user_tracking;

USE user_tracking;

CREATE TABLE
  users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    date DATE NOT NULL
  );

CREATE TABLE
  unique_user (
    userId VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
    date DATE NOT NULL
  );

CREATE TABLE
  count_user (
    total_unique_user INT DEFAULT 0,
    date DATE NOT NULL UNIQUE
  );