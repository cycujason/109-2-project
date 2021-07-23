require('dotenv').config();

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: {
    rejectUnauthorized: false
  }
});

module.exports = { pool };

// "process.env.postgres://blstutclxkkbwr:dc3e417a541805d2851b6ea711f8a0d5da4dd3cee39f9013af7e7902e132a11a@ec2-54-157-100-65.compute-1.amazonaws.com:5432/dd9lfi641bs1sa"