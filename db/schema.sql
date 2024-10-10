DROP DATABASE IF EXISTS rate_limiting;

CREATE DATABASE rate_limiting;

\c rate_limiting;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE token_blacklist (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);