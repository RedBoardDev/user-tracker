import express from 'express';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import { schedule } from "node-cron";

import { migrateAllUniqueUsers, migrateNewUniqueUsers } from './migrateNewUniqueUsers.js';
import { countAllUniqueUsers, countNewUniqueUsers } from './newUser.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 10,
});

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // TO CHANGE
    limit: 1000, // TO CHANGE
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

app.use(cors());
app.use(bodyParser.json());

app.post('/track', limiter, async (req, res) => {
    const { userId } = req.body;

    if (!userId)
        return res.status(400).json({ error: 'userId is required' });

    try {
        const connection = await pool.getConnection();
        const [rsp] = await connection.query('SELECT * FROM users WHERE userId = ? AND date = CURDATE()', [userId]);

        if (rsp.length === 0) {
            await connection.query('INSERT INTO users (userId, date) VALUES (?, CURDATE())', [userId]);
        }

        connection.release();
        res.sendStatus(200);
    } catch (err) {
        console.error('Error querying/inserting into MySQL:', err);
        res.status(500).json({ error: 'Tracking user failed' });
    }
});

app.get('/usercount/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const connection = await pool.getConnection();
        const [rsp] = await connection.query(
            date === "all"
                ? 'SELECT date, COUNT(userId) as userCount FROM users GROUP BY date'
                : 'SELECT COUNT(userId) as userCount FROM users WHERE date = ?',
            date === "all" ? [] : [date]
        );
        const [total] = await connection.query(
            'SELECT COUNT(DISTINCT userId) as total FROM users',
            []
        );

        connection.release();
        const userCount = date === "all" ? rsp : rsp[0].userCount;
        res.json({ data: userCount, total: total[0].total });
    } catch (err) {
        console.error('Error querying MySQL:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/uniqueusercount', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rsp] = await connection.query('SELECT date, total_unique_user FROM count_user');
        connection.release();
        res.json({ total: rsp });
    } catch (err) {
        console.error('Error querying MySQL:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const task = schedule('30 0 * * *', async () => {
    console.log('Scheduled task executed');
    await migrateNewUniqueUsers(pool);
    await countNewUniqueUsers(pool);
});

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await migrateAllUniqueUsers(pool);
    await countAllUniqueUsers(pool);
    task.start();
});
