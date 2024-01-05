import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit'
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

app.use(cors());
app.use(bodyParser.json());

con.connect((err) => {
    if (err) throw new Error(`Failed to connect to database ${process.env.DB_NAME}`);
    console.log('Successfully connected to the database ' + process.env.DB_NAME);
});

app.post('/track', limiter, (req, res) => {
    const { userId } = req.body;

    if (!userId)
        return res.status(400).json({ error: 'userId is required' });

    con.query('SELECT * FROM users WHERE userId = ? AND date = CURDATE()', [userId], (err, rsp) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (rsp.length === 0) {
            con.query('INSERT INTO users (userId, date) VALUES (?, CURDATE())', [userId], (err) => {
                if (err) {
                    console.error('Error inserting into MySQL:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(200);
        }
    });
});

app.get('/usercount/:date', (req, res) => {
    const { date } = req.params;

    const sqlQuery = date === "all"
        ? 'SELECT date, COUNT(userId) as userCount FROM users GROUP BY date'
        : 'SELECT COUNT(userId) as userCount FROM users WHERE date = ?';

    const queryParameters = date === "all" ? [] : [date];

    con.query(sqlQuery, queryParameters, (err, rsp) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const userCount = date === "all" ? rsp : rsp[0].userCount;
        return res.json({ userCount });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


function scheduleTask(task, interval) {
    task();
    setInterval(task, interval);
}

scheduleTask(async () => {
    con.query('DELETE FROM users WHERE date < DATE_SUB(CURDATE(), INTERVAL 365 DAY)', (err) => {
        if (err) {
            console.error('Error querying MySQL:', err);
        }
    });
}, 24 * 60 * 60 * 1000);
