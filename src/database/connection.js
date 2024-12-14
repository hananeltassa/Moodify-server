import dotenv from "dotenv";
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const connectDB = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`Connected to PostgreSQL at: ${result.rows[0].now}`);
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error.message);
        process.exit(1); 
    }
};


export { pool, connectDB }; 
