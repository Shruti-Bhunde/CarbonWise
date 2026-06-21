-- Active: 1771502508247@@127.0.0.1@3306@carbonwise_db
-- MySQL Script for CarbonWise
-- Create database and tables

CREATE DATABASE IF NOT EXISTS carbonwise_db;
USE carbonwise_db;

-- 1. User Table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    points INT DEFAULT 0,
    streak INT DEFAULT 0,
    streak_last_date VARCHAR(20) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. UserProfile Table
CREATE TABLE IF NOT EXISTS user_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    base_score INT NULL,
    score INT NULL,
    category VARCHAR(100) NULL,
    comparison VARCHAR(255) NULL,
    report TEXT NULL,
    breakdown JSON NULL,
    recommendations JSON NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 3. DailyQuest Table
CREATE TABLE IF NOT EXISTS daily_quest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quest_id_str VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    carbon_savings FLOAT NOT NULL,
    points INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    generated_date VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 4. History Table
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    carbon_saved FLOAT NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
