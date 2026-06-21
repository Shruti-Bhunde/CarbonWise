-- Active: 1771502508247@@127.0.0.1@3306@carbonwise_db
-- CarbonWise MySQL schema
CREATE DATABASE IF NOT EXISTS carbonwise_db;
DROP DATABASE carbonwise_db;

USE carbonwise_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    points INT DEFAULT 0,
    streak INT DEFAULT 0,
    streak_last_date VARCHAR(10) NULL,
    login_count INT DEFAULT 0,
    last_login_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    answers JSON NOT NULL,
    analysis JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quest_key VARCHAR(80) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    carbon_savings FLOAT NOT NULL,
    points INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    generated_date VARCHAR(10) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME NULL,
    INDEX idx_daily_quests_user_date (user_id, generated_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quest_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    carbon_saved FLOAT NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_history_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    summary_title VARCHAR(255) NOT NULL,
    report_body TEXT NOT NULL,
    metrics JSON NULL,
    next_steps JSON NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_user_date (user_id, generated_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_user_date (user_id, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
